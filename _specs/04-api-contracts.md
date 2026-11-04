# 4. API contracts

## 4.1 Shared request rules

4.1.1 Player calls require a Supabase access token in the `Authorization: Bearer` header.

4.1.2 The session supplies the caller's `player_id`.

4.1.3 Each installation supplies its persistent `device_id` through `X-Device-ID`.

4.1.4 Requests and responses use UTF-8 JSON.

4.1.5 IDs use strings; new client-generated IDs use UUIDs.

4.1.6 Dates use UTC ISO 8601 strings; elapsed times use integer milliseconds.

4.1.7 Successful calls return HTTP 200.

4.1.8 App POST and PATCH calls include `request_id`, except uploads use `game_id`.

4.1.9 Replies echo the supplied request or game ID.

4.1.10 Account creation, sign-in, password changes, username changes, and initial game downloads require internet access.

4.1.11 An expired session does not block cached offline games.

4.1.12 When a player attempts an action requiring internet while offline, show the shared message below.

| Message | Exact text |
| --- | --- |
| Offline; cached game and usable entitlement available | You're offline. You can do this when you're back online. For now, enjoy a game. |
| Offline; no playable cached game | You're offline. You can do this when you're back online. |

4.1.13 Supabase Auth calls bypass app request IDs and the saved-request queue in 4.8.

4.1.14 Balance requests include a saved snapshot of local `pending_game_ids`, using query parameters for GET calls.

4.1.15 Balance replies include accepted-game confirmations under 13.1.3 from the same transaction as their balances.

### Shared response fields

| Field | Contents |
| --- | --- |
| `player_state` | Confirmed `xp`, `coins`, `coin_shortfall`, `purchases_restricted`, `game_tokens`, `inventory`, `win_streak`, `last_reward_sequence`, device permits, and `last_free_permit_at` |
| `accepted_games` | Submitted pending IDs already accepted, with `result`, final scores from 3.3, `rewards`, and `reward_sequence` |
| `error.code` | Code from 4.8 |
| `error.message` | Readable explanation |
| `error.details` | Optional field errors or conflict values |

## 4.2 Download game bundles

Call: `POST /games/download`

| Direction | Field | Contents |
| --- | --- | --- |
| Request | `counts` | Counts keyed by `easy`, `medium`, and `hard`; 0–2 each, total 1–6; default 2 each |
| Request | `exclude_puzzle_ids` | Cached, active, or locally completed puzzle IDs; default empty |
| Request | `opponent_game_id` | Optional recording ID from a challenge link |
| Response | `download_id` | This request's ID |
| Response | `games[].entry_type` | Server-set `ordinary` for cache refills or `challenge` for requests under 4.2.5 |
| Response | `games[].difficulty` | Mode selected under Section 6 |
| Response | `games[].puzzle` | Fields from 3.2, with `word_list` as word-to-rarity pairs |
| Response | `games[].opponent` | Recording `id`, `player_snapshot`, `moves`, and `winning_knockout_ms` from 3.3 |
| Response | `games[].rules` | Scoring and knockout parameters from 7.1 |
| Response | `games[].knockout_seed` | Seed defined in 7.1; newly generated for each bundle |

4.2.1 Refill the ordinary cache under 6.3 using `counts` and `exclude_puzzle_ids`.

4.2.2 Select the requested number of puzzles for each difficulty using 6.4.

4.2.3 Pair each selected puzzle with an opponent recording under 6.5.

4.2.4 Return fewer bundles for a difficulty when fewer puzzles qualify for that difficulty.

4.2.5 Challenge requests supply only `request_id` and `opponent_game_id`.

4.2.6 Challenges return the selected recording's puzzle and difficulty in one separate bundle.

4.2.7 Look up current `words.rarity` values when building each bundle.

4.2.8 Save issued bundle identities and the retry response in `game_downloads` under 3.12.

4.2.9 The device retains each started game's bundle unchanged until the server confirms its upload.

4.2.10 Downloads neither issue nor consume play permits or tokens.

4.2.11 Check challenge recordings under 8.2.1, 8.3.7, and 8.3.13 instead of the random-opponent rules in 6.5.

Writes: Download receipt and any new bot recording.

Failures: `OPPONENT_NOT_FOUND`, `SELF_CHALLENGE`, `CHALLENGE_ALREADY_PLAYED`, `GAME_DATA_INCOMPLETE`, `NO_GAMES_AVAILABLE`.

## 4.3 Play permits

### Free grants on the device

4.3.1 Run free and subscription grant checks on app opening, before game start, and after permit assignment, online or offline.

4.3.2 Use this function for local grants and server interval checks.

```text
function free_grant_due(now, previous_grant_at):
    return previous_grant_at is null or now >= previous_grant_at + 24 hours
```

4.3.3 Grant free permits on the device with this procedure.

```text
procedure grant_free_permit(player_id, device_id, device_now):
    atomic device(player_id, device_id):
        if any(unused free permit on this device):
            return
        if not free_grant_due(device_now, last_free_permit_at):
            return
        permit = {id = new_uuid(), device_id, source = free,
                  request_id = null, issued_at = device_now, game_id = null}
        save permit
        queue permit in unacknowledged_free_grants
        last_free_permit_at = device_now
```

### Token-funded permits: `POST /games/permits`

| Direction | Field | Contents |
| --- | --- | --- |
| Request | `count` | Positive integer; default 1 |
| Response | `permits` | Newly issued records from 3.11 |
| Response | `game_tokens` | Remaining unallocated token balance |

4.3.4 Allocate token-funded permits through `apply_once` in 4.8.1 with this operation.

```text
function allocate_token_permits(request):
    count = request.input.count if supplied else 1
    require positive_integer(count) else INVALID_REQUEST
    require user.game_tokens >= count else INSUFFICIENT_TOKENS
    permits = repeat count times:
        {id = new_uuid(), device_id = request.device_id, source = token,
         request_id = request.id, issued_at = server_now, game_id = null}
    user.game_tokens -= count
    save permits
    return {permits, game_tokens = user.game_tokens}

procedure apply_token_reply(request, reply):
    confirmed.game_tokens = reply.game_tokens
    merge_device_permits(reply.permits, null)
```

Writes: Token balance, permit records, and request receipt.

Failures: `INSUFFICIENT_TOKENS`.

### Starting a game

4.3.5 At GO, save the game with this procedure before accepting submissions.

```text
procedure start_game(player_id, device_id, bundle, player_snapshot, device_now):
    atomic device(player_id, device_id):
        if an active game exists for this account on this installation:
            return resume_existing_game
        if bundle.status != unstarted:
            return game_already_started
        if bundle.entry_type == challenge and a local attempt under 8.3.13 exists:
            return existing_challenge_attempt
        game_id = new_uuid()
        permit = null
        if bundle.entry_type == ordinary:
            permit = first_unused_valid_permit_on_device(prefer = free, then = subscription, then = token)
            if permit is null:
                return needs_permit
            permit.game_id = game_id
            save permit
        mark bundle as started with game_id
        active_game_id = game_id
        save {player_id, device_id, game_id, bundle, player_snapshot, status = active, started_at = device_now,
              permit_id = permit.id if permit is not null else null}
    return game_id
```

4.3.6 Restore interrupted games under 7.2.4 without assigning another permit.

4.3.7 Show cached unused permits as playable offline and unallocated tokens as requiring internet.

### Synchronize free grants: `POST /games/permits/sync`

| Direction | Field | Contents |
| --- | --- | --- |
| Request | `local_grants` | Unacknowledged free-permit IDs and `issued_at` values, in grant order |
| Request | `subscription_grants` | Unacknowledged grant records from 4.3.14, in grant order; default empty |
| Response | `play_permits` | Server permit records for this device |
| Response | `last_free_permit_at` | Latest synchronized grant timestamp across the account |

4.3.8 Save incoming free grants through `apply_once` in 4.8.1 with this operation.

```text
function synchronize_free_grants(request):
    previous = latest_free_grant_at_for_device(request.device_id)
    for grant in request.input.local_grants in supplied order:
        stored = find_permit(grant.id)
        if stored exists:
            require stored owner, device, source, and issued_at match grant
                else INVALID_PERMIT
            continue
        require free_grant_due(grant.issued_at, previous) else INVALID_PERMIT
        save_free_permit(grant, request.player_id, request.device_id)
        previous = grant.issued_at
        user.last_free_permit_at = max_known(user.last_free_permit_at, previous)
    synchronize_subscription_grants_under_4_3_15(request)
    return {play_permits = permits_for_device(request.device_id),
            last_free_permit_at = user.last_free_permit_at}
```

4.3.9 Merge successful grant replies with this procedure.

```text
procedure apply_free_grant_reply(request, reply):
    atomic device(request.player_id, request.device_id):
        merge_device_permits(reply.play_permits, reply.last_free_permit_at)
        remove only request.input.local_grants.ids from unacknowledged_free_grants
        remove only submitted subscription_grants.ids from unacknowledged_subscription_grants

procedure merge_device_permits(server_permits, server_last_free_permit_at):
    for server_permit in server_permits:
        local_assignment = game_id of local_permits.get(server_permit.id), or null
        local_permits[server_permit.id] = server_permit
        if server_permit.game_id is null:
            local_permits[server_permit.id].game_id = local_assignment
    last_free_permit_at = max_known(last_free_permit_at, server_last_free_permit_at)
```

4.3.10 Synchronize grants through 13.2 before uploading their games.

4.3.11 Synchronize subscription grants through `POST /games/permits/sync` using 4.3.15.

4.3.12 Only one tab may write the active game, using the ownership rule in 13.1.6.

4.3.13 Leaving gameplay keeps its game active until the ending rules in 7.8 apply.

4.3.14 Refill subscription permits locally with this procedure.

```text
procedure refill_subscription(player_id, device_id, now):
    atomic device(player_id, device_id):
        if now >= subscription.paid_through:
            return
        previous = latest subscription grant on this installation
        if previous exists and now < previous.issued_at + 24 hours:
            return
        grant = {id = new_uuid(), issued_at = now,
                 paid_through = subscription.paid_through,
                 expires_at = min(now + 24 hours, subscription.paid_through)}
        grant.permits = for slot from 1 through 10:
            {id = new_uuid(), device_id, source = subscription, grant_id = grant.id,
             slot, issued_at = now, expires_at = grant.expires_at,
             paid_through = grant.paid_through, game_id = null}
        save grant and its permits
        queue grant in unacknowledged_subscription_grants
```

4.3.15 Save subscription grants before their game uploads with this operation.

```text
procedure synchronize_subscription_grants_under_4_3_15(request):
    previous = latest stored subscription grant for this account and device
    for grant in request.input.subscription_grants in grant order:
        if grant.id already exists:
            require its immutable fields and permit IDs match else INVALID_PERMIT
            continue
        require grant contains exactly the ten distinct permit slots in 4.3.14
        require grant's interval and expiry follow 4.3.14 else INVALID_PERMIT
        require saved paid-cycle history covers grant.issued_at and grant.paid_through
            else INVALID_PERMIT
        require previous is null or grant.issued_at >= previous.issued_at + 24 hours
            else INVALID_PERMIT
        save grant.permits with this owner and device
        previous = grant
```

4.3.16 A subscription permit must cover `started_at`, even when upload occurs after its expiry.

4.3.17 Free and token permits have no automatic expiry.


Writes: Free and subscription permits, `last_free_permit_at`, and request receipt.

Failures: `INVALID_PERMIT`.

## 4.4 Upload played games

Call: `POST /games/upload`

| Request field | Source |
| --- | --- |
| `game_id` | ID assigned at game start |
| `download_id` | Receipt for the cached bundle |
| `puzzle_id`, `opponent_game_id` | Selected bundle |
| `difficulty` | Selected bundle's mode |
| `permit_id` | Assigned permit for ordinary games; null for challenges |
| `player_snapshot` | Identity displayed at game start, including locally earned XP |
| `moves` | This player's accepted submissions from 3.3 |
| `started_at`, `completed_at` | Device timestamps |
| `result`, `end_reason`, `final_score`, `final_opponent_score`, `winning_knockout_ms` | Completed match recorded by the device |

### Upload checks and saving

| Input | Check |
| --- | --- |
| `download_id` | Caller's issued puzzle, opponent, difficulty, and entry type under 3.12 |
| `permit_id` | Ordinary games require an unrevoked permit owned by this account and device, valid at start and unassigned to another game; challenges require null |
| `player_snapshot` | Required fields, nonnegative XP, and valid avatar slots |
| `moves` | Word/time pairs with unique words and ordered integer times within the recorded match |
| Recorded outcome | Valid result and ending enums, nonnegative integer scores, and consistent timestamps |
| `winning_knockout_ms` | Matches the recorded ending for a knockout win; null otherwise |

4.4.1 Save uploads through `apply_once` in 4.8.1 with this operation.

```text
function save_recorded_game(request):
    submitted = request.input
    issued = caller_owned_issued_game(submitted.download_id, submitted.opponent_game_id)
    validate_structure_and_ownership_using_the_table_above(request, issued)
    if issued.entry_type == challenge:
        require no saved challenge by this caller against issued.opponent_game_id
            else CHALLENGE_ALREADY_PLAYED
    game = played_game_fields_from_submitted_record(submitted)
    game.player_id = request.player_id
    game.is_bot = false
    game.entry_type = issued.entry_type
    game.opponent_snapshot = played_game(issued.opponent_game_id).player_snapshot
    game.reward_sequence = user.last_reward_sequence + 1
    game.opponent_eligible = opponent_eligible(game)
    next_streak = streak_after(user.win_streak, game.result)
    rewards = calculate_rewards(game, user.xp, game.opponent_snapshot, next_streak)
    if game.entry_type == ordinary:
        assign_stored_permit(submitted.permit_id, submitted.game_id)
    save game, failing with GAME_ID_CONFLICT if its ID already exists
    user.win_streak = next_streak
    user.last_reward_sequence = game.reward_sequence
    user.xp += rewards.xp
    rewards.coin_shortfall_repaid = credit_coins(user, rewards.coins)
    return {score = game.final_score, opponent_score = game.final_opponent_score,
            result = game.result, rewards, reward_sequence = game.reward_sequence,
            player_state = current_player_state()}
```

| Response field | Contents |
| --- | --- |
| `score`, `opponent_score`, `result` | Saved match values |
| `rewards` | Server-calculated XP, gross coins, and `coin_shortfall_repaid` under 11.8 |
| `reward_sequence` | Acceptance order assigned under 10.6.3 |
| `player_state` | Confirmed values from 4.1 after shortfall recovery under 11.8 |

### Local rewards and upload order

4.4.2 A pending game is completed without a locally saved upload confirmation or server rejection.

4.4.3 A rejected game is completed but refused by the server for invalid game data or permit use.

4.4.4 Save completed local games with this procedure before presenting results.

```text
procedure save_finished_game(game, replay):
    atomic device(game.player_id, game.device_id):
        save game with status = pending, result = replay.result, end_reason = replay.end_reason,
            final_score = replay.player.score, final_opponent_score = replay.opponent.score,
            winning_knockout_ms = replay.end_elapsed_ms if replay.result == win and
                replay.end_reason == knockout else null
        clear active_game_id if it equals game.id
        recalculate_pending_rewards_under_10_2_3()
        queue original upload fields and pending_game_ids under game.id using 4.1.14
```

4.4.5 Apply successful upload replies with this procedure.

```text
procedure apply_game_reply(request, reply):
    atomic device(request.player_id, request.device_id):
        require reply.accepted_games contains request.input.game_id
        apply_confirmed_player_state(reply.player_state, reply.accepted_games)
```

4.4.6 Apply terminal upload rejections with this procedure.

```text
procedure reject_local_game(request, error):
    atomic device(request.player_id, request.device_id):
        game = local_game(request.input.game_id)
        game.status = rejected
        game.rejection = error
        remove game.estimated_rewards
        move its saved upload request outside the automatic upload queue
        recalculate_pending_rewards_under_10_2_3()
```

4.4.7 Use 13.2 for upload ordering and 10.2 for displayed XP, coins, and level.

4.4.8 Accept recorded words, scores, and outcomes without rerunning word validation, scoring, or knockout rolls.

4.4.9 Calculate rewards from the recorded match and confirmed account state using the server's current reward rules.

Writes: Played game, permit use for ordinary games, XP, coins, and upload receipt.

Failures: `INVALID_PERMIT`, `PERMIT_USED`, `INVALID_GAME_DATA`, `GAME_ID_CONFLICT`, `CHALLENGE_ALREADY_PLAYED`.

## 4.5 Player data

| Call | Request fields | Response | Writes |
| --- | --- | --- | --- |
| `GET /player` | None | Profile fields listed below | None |
| `GET /player/username-availability` | Query: `username` | `available`, rejection `reason` when applicable | None |
| `PATCH /player` | Supplied `username`, `avatar`, or `settings` | Saved fields | Supplied fields, username timestamps when applicable, and request receipt |

Profile fields: `id`, `username`, `avatar`, `settings`, subscription status, and `player_state` from 4.1.

4.5.1 Return only the current device's permits in player responses.

4.5.2 Enforce 1.2.14 for username and avatar changes.

4.5.3 Updates change only supplied fields and settings keys.

4.5.4 Validate avatars against 3.9, equipment against 3.6.2, and settings against 3.4.

4.5.5 Apply the username rules and change limits from Section 5.

4.5.6 Availability checks do not reserve usernames.

4.5.7 Audio changes take effect locally before synchronization.

Failures: `ACCOUNT_REQUIRED`, `INVALID_USERNAME`, `USERNAME_TAKEN`, `USERNAME_CHANGE_LIMIT`, `ITEM_NOT_OWNED`, `INVALID_AVATAR`, `INVALID_SETTINGS`.

## 4.6 Archive

| Call | Request fields | Response | Writes |
| --- | --- | --- | --- |
| `GET /archive` | Optional `cursor`, `limit` | `games`, `next_cursor`, win/loss/tie totals | None |
| `GET /archive/games/{game_id}` | Owned game ID | `game`, practice `bundle`, `found_words`, progress | None |
| `GET /archive/games/{game_id}/challenges` | Owned game ID; optional `cursor`, `limit` | `challenges`, `next_cursor` | None |
| `POST /archive/words` | Owned `game_id`, `words` array | `accepted_words`, `rejected_words` with reasons, `found_words`, progress | Archive progress and request receipt |

### List and progress fields

| Field | Contents |
| --- | --- |
| `games[]` | `id`, `puzzle_id`, `difficulty`, `result`, `final_score`, `final_opponent_score`, `opponent_snapshot`, `completed_at`, progress |
| `game` | Fields from 3.3 except `download_id`, `permit_id`, `player_id`, `is_bot`, and `opponent_eligible` |
| `bundle` | Practice data containing the puzzle; excludes the original opponent, scoring rules, and seed |
| `found_words` | Unique valid words found across the caller's timed games and practice for this puzzle |
| `found_count` | Unique valid words from timed games and practice for this puzzle |
| `total_count` | Puzzle word count |
| `completion_percent` | Percentage calculated under 8.5.4 |
| `next_cursor` | Next page cursor; null on the final page |
| `challenges[]` | Challenge `game_id`, `player_snapshot`, `result` from the challenger's perspective, and `completed_at` |

4.6.1 Restrict archive lists, game details, and practice calls to the caller's games.

4.6.2 Sort lists by `completed_at` descending, then `id` descending.

4.6.3 `limit` defaults to 20 and accepts integers from 1 through 100.

4.6.4 Validate each practice word against the referenced puzzle.

4.6.5 Merge accepted words into `archive_progress` by puzzle ID, removing duplicates.

4.6.6 A valid practice request can save accepted words while reporting rejected words.

4.6.7 Practice leaves timed-game results, XP, coins, and permits unchanged.

4.6.8 Challenge-result calls require ownership of the source recording and select replies under 8.6.2.

4.6.9 Apply 4.6.2 and 4.6.3 to challenge-result pagination.

Failures: `GAME_NOT_FOUND`, `GAME_DATA_INCOMPLETE`.

## 4.7 Store and billing

### Player calls

| Call | Request fields | Response | Writes |
| --- | --- | --- | --- |
| `GET /store/catalog` | None | `products`, including subscriptions | None |
| `POST /store/purchases` | `product_id`, `expected_coin_price` | `receipt`, `grants`, `player_state` | Coins, inventory or tokens, receipt |
| `POST /store/chests/open` | Owned chest `item_id` | `receipt`, `grants`, `player_state` | Chest quantity, rewards, receipt |
| `POST /store/checkout` | `product_id` | `order_id`, `checkout_url` | Pending order and provider checkout reference |
| `GET /store/orders/{order_id}` | Owned order ID | `order_id`, `status`, `reversal_state`, `receipt`, fulfilled `grants` | None |
| `GET /store/subscription` | None | `status`, `effective_at`, `ends_at`, `paid_through`, `benefits` | None |
| `POST /store/subscription/manage` | None | `management_url` | Provider management-session reference |

### Response objects

| Object | Fields |
| --- | --- |
| Product | `id`, `name`, `type`, `image`, `price`, `requirements`, `owned` |
| Price | Integer `amount`; `currency` as `coins` or an ISO currency code; money prices localized under 11.4.8 |
| Requirements | `min_level`, `subscription_required`, `available` |
| Receipt | `id`, `product_id`, `status`, `created_at` |
| Grants | Awarded item IDs and quantities, XP, gross coins, tokens, and `coin_shortfall_repaid` |
| Order status | `pending`, `fulfilled`, `failed`, or `expired`; refunds and disputes reported separately as `reversal_state` |

4.7.1 Purchases and chest opening require internet access.

4.7.2 Use `content/catalog/` for prices, requirements, and rewards.

4.7.3 Money amounts use the currency's minor unit.

4.7.4 Check product availability, ownership limits, confirmed level, subscription, balance, 5.5.3, and purchase restrictions under 11.8.

4.7.5 Opening a chest consumes one item and saves its rolled rewards.

### Checkout recovery

4.7.6 Create or recover checkout with this procedure.

```text
procedure prepare_checkout(request):
    order = apply_once(request, reserve_checkout_order)
    if order.provider_checkout_id exists:
        return saved_checkout_response(order)
    checkout = provider.find_checkout_by_order_id(order.id)
    if checkout lookup is uncertain:
        fail BILLING_UNAVAILABLE
    if checkout is not found:
        checkout = provider.create_checkout(order, duplicate_key = order.id)
    if creation outcome is uncertain:
        fail BILLING_UNAVAILABLE
    atomic server(lock request.player_id):
        save checkout ID and URL on order
    return saved_checkout_response(order)

function reserve_checkout_order(request):
    check product and account requirements under 4.7.4
    product = catalog_item(request.input.product_id)
    order = {id = new_uuid(), player_id = request.player_id,
             product, stripe_price_id = product.stripe_price_id,
             server_price = product.base_price.amount,
             currency = product.base_price.currency, request_id = request.id,
             currency_prices = copy(product.currency_prices),
             status = pending}
    save order
    return reference_to(order)
```

4.7.7 Checkout and management pages use server-configured return destinations.

4.7.8 The management page supports subscription cancellation.

Failures: `ACCOUNT_REQUIRED`, `PRODUCT_NOT_FOUND`, `ITEM_LOCKED`, `INSUFFICIENT_COINS`, `PRICE_CHANGED`, `ITEM_ALREADY_OWNED`, `ITEM_NOT_OWNED`, `ORDER_NOT_FOUND`, `SUBSCRIPTION_NOT_FOUND`, `PURCHASES_RESTRICTED`, `BILLING_UNAVAILABLE`.

### Provider callback: `POST /store/provider-events`

| Field | Contents |
| --- | --- |
| Caller | Payment provider |
| Request | Original event bytes and signature headers |
| Replay ID | Provider event ID |
| Writes | Event receipt, order fulfillment, subscription state, purchased grants |

4.7.9 Handle provider callbacks serially per subscription or payment with this procedure.

```text
procedure process_provider_event(original_bytes, signature_headers):
    event = provider.verify_signature(original_bytes, signature_headers)
    if verification fails:
        fail INVALID_SIGNATURE
    if event is unrelated to app orders or subscriptions:
        return acknowledged
    owner = owner_of_saved_provider_reference(event)
    process in subscription_or_payment_queue(event):
        current_state = provider.fetch_current_state(event)
        payment = provider.verify_event_payment_or_cycle(event)
        atomic server(lock owner.player_id):
            if event.id is already in billing_events:
                return acknowledged
            verify provider references match the saved order or subscription
            if event concerns a subscription:
                save current_state on the subscription
            if payment is confirmed paid:
                verify saved product, Stripe Price ID, and billing-cycle ID
                verify payment amount and currency against the saved base price
                    or fixed local price for the order or subscription
                customer_payment = payment.presentment_details if present,
                    otherwise the payment's base-currency amount and currency
                fulfillment_key = (subscription.id, payment.cycle_id)
                    if payment has a billing cycle, otherwise payment.id
                if fulfillment_key has no fulfillment receipt:
                    grant the purchased items or paid-cycle benefits
                    save fulfillment receipt keyed by fulfillment_key,
                        including customer_payment and the confirmed paid-cycle interval
                save customer_payment and provider payment reference on the related order
                mark the related order fulfilled, when an order exists
            else if related order exists and order.status != fulfilled:
                update order from current_state
            reconcile finalized reversals under 11.8 using current provider state
            record event.id in billing_events
    return acknowledged
```

Failures: `INVALID_SIGNATURE`, `TEMPORARY_FAILURE`.

4.7.10 Map provider events to the payment and reversal operations in 11.8 before implementation.

## 4.8 Retries and failures

### Saving changes on the server

4.8.1 Apply server mutations once with this function, using IDs under 4.1.8.

```text
function apply_once(request, operation):
    atomic server(lock request.player_id):
        receipt = find_receipt(request.player_id, request.endpoint, request.id)
        if receipt exists:
            if receipt.input != request.input:
                fail GAME_ID_CONFLICT for game uploads, otherwise REQUEST_ID_CONFLICT
            return saved_result_with_refreshed_balances_permits_and_game_confirmations(receipt, request.input.pending_game_ids)
        response = operation(request)
        if response contains player_state:
            response.accepted_games = confirmations_for(request.input.pending_game_ids)
        save_receipt(request.endpoint, request.id, request.input, response)
    return response
```

4.8.2 Release database locks before waiting for payment-provider replies.

4.8.3 Never include passwords, access tokens, or payment-provider secret keys in error responses.

### Sending and retrying requests on the device

4.8.4 Send saved requests and apply successful replies with this procedure.

```text
procedure send_saved_request(request, apply_reply):
    if request.automatic_retries_stopped:
        return request.saved_error
    save request ID and exact submitted data before its first send
    refreshed_session = false
    while online and active_player_id == request.player_id:
        reply = send_original_request(request)
        if reply is successful:
            try:
                atomic device(request.player_id, request.device_id):
                    if request is no longer queued:
                        return success
                    save reply
                    apply_reply(request, reply)
                    remove request from queue
            catch storage_failure:
                return local_storage_failure
            return success
        if reply is connection_failure or HTTP 5xx:
            wait progressively longer before retrying
            continue
        if reply is HTTP 429:
            wait for Retry-After
            continue
        if reply is HTTP 401 and not refreshed_session:
            refreshed_session = true
            if refresh_session_for(request.player_id) succeeds:
                continue
        if reply is HTTP 401:
            retain request for retry after this account signs in again
            return session_required
        save failure and stop automatic retries for this request
        return reply.error
    return paused
```

4.8.5 Send corrected inputs with a new `request_id`, retaining `game_id` only for games not saved by the server.

4.8.6 Keep cached data and queued requests under their original account as defined in 13.1.

4.8.7 Hold the device's shared balance-request gate while sending requests that change or refresh balances.

4.8.8 Read and write request, purchase, chest, and fulfillment receipts through `operation_receipts` in 3.13.

4.8.9 Pause retries for offline storage failures without changing the original request IDs.

### Error registry

| Code | HTTP | Condition |
| --- | --- | --- |
| `INVALID_REQUEST` | 400 | Missing required fields or invalid field values, cursors, or limits |
| `INVALID_USERNAME` | 400 | Username violates Section 5 rules |
| `INVALID_AVATAR` | 400 | Avatar violates 3.9 format or 3.6.2 equipment rules |
| `INVALID_SETTINGS` | 400 | Settings violate the 3.4 format |
| `INVALID_SIGNATURE` | 400 | Provider signature verification failed |
| `SESSION_REQUIRED` | 401 | Missing, invalid, or expired session |
| `ACCOUNT_REQUIRED` | 403 | Guest attempts a registered-only action |
| `ITEM_LOCKED` | 403 | Product level or subscription requirement unmet |
| `PURCHASES_RESTRICTED` | 403 | Account purchases restricted pending manual review |
| `ITEM_NOT_OWNED` | 403 | Player does not own the requested item |
| `SELF_CHALLENGE` | 403 | Caller owns the challenge recording |
| `CHALLENGE_ALREADY_PLAYED` | 409 | Caller has completed a challenge against this recording; details include its game ID |
| `OPPONENT_NOT_FOUND` | 404 | Requested opponent recording unavailable |
| `GAME_NOT_FOUND` | 404 | Game unavailable to the caller |
| `PRODUCT_NOT_FOUND` | 404 | Product unavailable |
| `ORDER_NOT_FOUND` | 404 | Order unavailable to the caller |
| `SUBSCRIPTION_NOT_FOUND` | 404 | No subscription to manage |
| `NO_GAMES_AVAILABLE` | 404 | No puzzles qualify for the requested download |
| `REQUEST_ID_CONFLICT` | 409 | Request ID reused with different input |
| `GAME_ID_CONFLICT` | 409 | Game ID belongs to another player or different input |
| `PERMIT_USED` | 409 | Another game already uses the permit |
| `USERNAME_TAKEN` | 409 | Username unavailable at save time |
| `USERNAME_CHANGE_LIMIT` | 409 | Player has reached the username-change limit in Section 5 |
| `INSUFFICIENT_TOKENS` | 409 | Token balance below the requested permit count |
| `INSUFFICIENT_COINS` | 409 | Coin balance below the purchase price |
| `PRICE_CHANGED` | 409 | Price changed; details include the current coin price |
| `ITEM_ALREADY_OWNED` | 409 | Duplicate purchase of a non-stackable item |
| `INVALID_PERMIT` | 422 | Unknown permit, wrong owner or device, or invalid free grant |
| `INVALID_GAME_DATA` | 422 | Failed upload checks in 4.4 |
| `GAME_DATA_INCOMPLETE` | 422 | Puzzle, word-rarity, or recording data needed for the bundle is missing |
| `RATE_LIMITED` | 429 | Request rate exceeded |
| `TEMPORARY_FAILURE` | 503 | Temporary server failure; retry the same request |
| `BILLING_UNAVAILABLE` | 503 | Payment provider temporarily unavailable |

### Implementation references

- [Supabase sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase guest identities](https://supabase.com/docs/guides/auth/auth-anonymous)
- [PostgreSQL row locks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS)
- [Payment callback verification](https://docs.stripe.com/webhooks)
- [Provider duplicate-request keys](https://docs.stripe.com/api/idempotent_requests)
