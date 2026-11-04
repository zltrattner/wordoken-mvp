# 13. Offline storage and synchronization

## 13.1 Device data

13.1.1 Store offline data in IndexedDB under its original `player_id` and `device_id`.

| Local data | Contents |
| --- | --- |
| Cached and active games | Original bundles, snapshots, moves, start time, and saved elapsed time |
| Permits | Local assignments, unacknowledged free grants, and `last_free_permit_at` |
| Completed games | Pending, accepted, and rejected records from 4.4 |
| Confirmed player state | Server-confirmed XP, coins, shortfall, purchase restriction, tokens, inventory, streak, and reward sequence |
| Subscription | Last confirmed subscription state, including `paid_through` under 11.5.7 |
| Practice progress | Confirmed words and words queued by owned game ID |
| Settings | Local values and queued per-key changes |
| Saved requests | Original IDs, submitted data, replies, and stopped-request errors |
| Archive cache | Downloaded pages, opened bundles, and challenge results |
| Ad progress | Completed-game count and counted-game markers under 12.8 |

13.1.2 Read active screens from the active account's data only.

13.1.3 Apply confirmed player state inside the reply's device transaction with this procedure.

```text
procedure apply_confirmed_player_state(state, accepted_games):
    confirmed = state fields {xp, coins, coin_shortfall, purchases_restricted, game_tokens, inventory, win_streak, last_reward_sequence}
    merge_device_permits(state.play_permits, state.last_free_permit_at)
    for confirmation in accepted_games:
        game = local_game(confirmation.game_id)
        game.status = accepted
        game.result = confirmation.result
        game.final_score = confirmation.final_score
        game.final_opponent_score = confirmation.final_opponent_score
        game.confirmed_rewards = confirmation.rewards
        game.reward_sequence = confirmation.reward_sequence
        remove game.estimated_rewards and its queued upload
        confirmed_found_words[game.puzzle_id] union= set(game.moves.words)
        update_all_archive_entries(game.puzzle_id, practice_progress(game.puzzle_id))
    recalculate_pending_rewards_under_10_2_3()

procedure apply_player_read(request, reply):
    apply_confirmed_player_state(reply.player_state, reply.accepted_games)
    save profile fields returned under 4.5 for request.player_id
    overlay any queued local settings keys on the returned settings
```

13.1.4 Synchronization procedures use the data for their captured `player_id` and `device_id` throughout the run.

13.1.5 Save accepted moves before displaying their scores or animations.

13.1.6 Hold an installation-wide game-writer lock while starting or controlling a timed game.

13.1.7 A replacement writer restores the saved game under 7.2.4 before accepting input.

## 13.2 Synchronization sequence

13.2.1 With the balance-request gate held, synchronize grants and games with this procedure.

```text
procedure synchronize_games(player_id, device_id):
    loop:
        if active_player_id != player_id:
            return paused
        atomic device(player_id, device_id):
            if unacknowledged_free_grants or unacknowledged_subscription_grants is not empty:
                input = {local_grants = snapshot of unacknowledged_free_grants in grant order,
                         subscription_grants = snapshot of unacknowledged_subscription_grants in grant order}
                request = existing_or_saved_request(player_id, device_id,
                    POST /games/permits/sync, device_id, input)
                apply_reply = apply_free_grant_reply
            else if any pending game exists:
                game = oldest pending game by local completion
                request = saved_original_upload(game.id)
                apply_reply = apply_game_reply
            else:
                return success
        result = send_saved_request(request, apply_reply)
        if request.endpoint == POST /games/upload and
                result is a terminal upload rejection listed in 4.4:
            reject_local_game(request, result)
        else if result != success:
            return result
```

13.2.2 On reconnection, continue synchronization with this procedure.

```text
procedure synchronize_on_reconnection(player_id, device_id):
    with balance_request_gate(player_id, device_id):
        if synchronize_games(player_id, device_id) != success:
            return
        for game_id with queued practice words and an accepted local game:
            request = existing_or_saved_request(player_id, device_id, POST /archive/words, game_id,
                {game_id, words = snapshot of queued_practice_words[game_id]})
            if send_saved_request(request, apply_practice_reply) != success:
                return
        if synchronize_games(player_id, device_id) != success:
            return
        if synchronize_settings(player_id, device_id) != success:
            return
        request = existing_or_saved_request(player_id, device_id, GET /player, player_id, empty_input)
        if send_saved_request(request, apply_player_read) != success:
            return
    refill_game_cache(player_id, device_id)
```

13.2.3 Run balance refreshes and purchases with this procedure.

```text
procedure run_balance_action(request, apply_reply):
    if not online:
        show the offline message under 4.1.12
        return requires_connection
    with balance_request_gate(request.player_id, request.device_id):
        if synchronize_games(request.player_id, request.device_id) != success:
            return waiting_for_uploads
        return send_saved_request(request, apply_reply)
```

13.2.4 Select immutable saved requests with this function.

```text
function existing_or_saved_request(player_id, device_id, endpoint, group_key, new_input):
    atomic device(player_id, device_id):
        existing = oldest unresolved request for this account, endpoint, and group_key
        if existing exists:
            return existing
        input = copy(new_input)
        if endpoint returns confirmed balances:
            input.pending_game_ids = IDs of all local pending games
        request = {id = new_uuid(), player_id, device_id, endpoint, group_key, input}
        save request before its first send
    return request
```

13.2.5 The balance-request gate is shared by browser tabs on the same installation.

13.2.6 Refill ordinary bundles with this procedure.

```text
procedure refill_game_cache(player_id, device_id):
    atomic device(player_id, device_id):
        counts = refill_counts(cached_bundles)
        if sum(counts.values) == 0:
            return
        input = {counts, exclude_puzzle_ids = exclusions_under_6_4_2()}
        request = existing_or_saved_request(player_id, device_id,
            POST /games/download, ordinary_cache, input)
    send_saved_request(request, apply_download_reply)

procedure apply_download_reply(request, reply):
    for bundle in reply.games:
        key = (reply.download_id, bundle.puzzle.id)
        if key is not already stored:
            save {key, bundle, download_id = reply.download_id, status = unstarted}
```

13.2.7 Save settings changes and synchronize them with these procedures.

```text
procedure change_settings(changed_keys):
    atomic device(active_player_id, device_id):
        apply changed_keys to local settings
        append changed_keys with new local sequence to settings_changes

procedure synchronize_settings(player_id, device_id):
    while settings_changes is not empty:
        if active_player_id != player_id:
            return paused
        batch = oldest unacknowledged settings change
        request = existing_or_saved_request(player_id, device_id,
            PATCH /player, batch.sequence, {settings = batch.changed_keys})
        if send_saved_request(request, apply_settings_reply) != success:
            return paused
    return success

procedure apply_settings_reply(request, reply):
    remove only the settings change identified by request.group_key
    save returned settings
    overlay remaining queued changes in local sequence order
```

## 13.3 Retention and recovery

13.3.1 Retain issued-game identities, consumed permit IDs, and mutation receipt keys for the account's lifetime.

13.3.2 Retain download retry responses until every issued bundle is accepted or abandoned by the device.

13.3.3 Never remove the response referenced by an unresolved download request.

13.3.4 After storage loss, registered players recover confirmed progress, inventory, and unallocated tokens by signing in.

13.3.5 Lost pending games and unsynchronized practice words cannot be recovered from the server.

13.3.6 Token permits remain assigned to their original installation until operator-assisted recovery.

13.3.7 Recovery revokes unused old token permits and restores the same token count in one receipted transaction.

13.3.8 Revoked permits cannot fund later uploads from the old installation.

13.3.9 Apply free and subscription refill rules to a new installation under the accepted multi-device policy.

13.3.10 Increment the local storage schema number for migrations and retain the original data if migration fails.

13.3.11 Treat migration failure as a storage error under 13.4 rather than clearing the account's local data.

## 13.4 Offline readiness and recovery

13.4.1 Require the cached app shell, game bundle, required sprite atlases, writable storage, and applicable permit before countdown.

13.4.2 A failed start transaction consumes no permit and leaves the bundle unstarted.

13.4.3 On a move-save failure, block new input and show a storage error while the match clock continues.

13.4.4 After storage recovers, restore the committed game before accepting new input.

13.4.5 Keep a failed final save available for retry without presenting its rewards as saved.

13.4.6 Request persistent browser storage and show whether offline preparation succeeded.

13.4.7 Activate app updates only when no timed game is active.

13.4.8 Migrate pending games, permits, settings changes, and saved requests without clearing them.

13.4.9 Free storage by removing unused assets and unstarted bundles while retaining active games and unsynchronized records.

13.4.10 Use 13.3 for account and permit recovery after storage loss.
