# 3. Database structures

## 3.1 Import source

3.1.1 Import initial puzzles from [finished_games_20231225.json](../technical-reference/database/puzzles/finished_games_20231225.json).

## 3.2 Puzzles

| Field | Contents |
| --- | --- |
| `id` | Stable puzzle ID; primary key |
| `all_letters` | Available letters |
| `fixed_letters` | Required letters |
| `word_list` | JSON array of valid words |
| `wordoken_list` | JSON array imported from `wordokenList` |
| `edited` | Boolean; defaults to `false` |

3.2.1 Calculate letter count and optional letters from the stored letters.

3.2.2 Each puzzle word must exist in `words.word`.

3.2.3 Every Wordoken must appear in `word_list`.

3.2.4 Keep issued puzzles' letters and word membership unchanged under their existing IDs.

3.2.5 Set `edited` to `true` after manually reviewing and correcting the puzzle's letters and word lists.

## 3.3 Played games

| Field | Contents |
| --- | --- |
| `id` | Unique game ID; primary key |
| `download_id` | Originating download request ID; unset for bot seed records |
| `entry_type` | `ordinary` or `challenge`, copied from the server's saved bundle; null for bot seed records |
| `permit_id` | Unique permit reference; null for challenges and bot seed records |
| `puzzle_id` | Foreign key to `puzzles.id` |
| `difficulty` | `easy`, `medium`, or `hard` |
| `player_id` | Reference to `users.id`; unset for bots |
| `player_snapshot` | Snapshot captured at game start |
| `opponent_snapshot` | Player snapshot copied from the selected recording; unset for bot seed records |
| `is_bot` | Server-only marker for generated recordings |
| `opponent_eligible` | Server-only human-recording eligibility under 6.5; unset for bot seeds |
| `opponent_game_id` | Reference to the opponent's `played_games.id`; unset for bot seed records |
| `moves` | This player's accepted words containing `word` and `elapsed_ms` |
| `result` | Original match outcome; unset only for generated bot seed records |
| `end_reason` | Recorded `timeout` or `knockout`; null for bot seeds |
| `final_score` | Recorded player score at the original match ending; null for bot seeds |
| `final_opponent_score` | Recorded opponent score at the original match ending; null for bot seeds |
| `winning_knockout_ms` | Recorded elapsed time of this player's knockout win; null otherwise |
| `reward_sequence` | Account-specific server acceptance order; unset for bot seeds |
| `started_at` | Device game-start timestamp |
| `completed_at` | Logical match-ending timestamp under 7.8.3 |

### Snapshot fields

| Field | Contents |
| --- | --- |
| `username` | Display name at game start |
| `xp` | XP before this game's rewards |
| `avatar` | Avatar object from 3.9 |

3.3.1 A game's opponent recording must reference the same puzzle.

3.3.2 Recorded snapshots remain unchanged after profile updates.

3.3.3 Completed games enter the random opponent pool only under 6.5.

3.3.4 Save `win`, `loss`, or `tie` against human and bot opponents.

3.3.5 Saved final scores are archive display values; new matches calculate scores from recorded words.

## 3.4 Users

3.4.1 Guest and registered profiles share the `users` table.

3.4.2 Calculate player level from XP under 10.3.1.

| Field | Contents |
| --- | --- |
| `id` | Primary key linked to `auth.users.id` |
| `username` | Player name |
| `username_selected_at` | Server timestamp of the first chosen name; null while using the generated guest name |
| `username_changes` | JSON array of successful change timestamps within the last 30 days |
| `xp` | Confirmed accumulated XP |
| `coins` | Confirmed spendable coin balance |
| `coin_shortfall` | Nonnegative coin amount awaiting recovery under 11.8; initially zero |
| `purchases_restricted` | Manual purchase restriction under 11.8; initially false |
| `win_streak` | Consecutive wins calculated under 10.6.2; initially zero |
| `last_reward_sequence` | Latest accepted game sequence under 10.6.3; initially zero |
| `game_tokens` | Unallocated game-token balance |
| `last_free_permit_at` | Latest synchronized free-grant timestamp across devices |
| `inventory` | JSON item IDs and owned quantities |
| `avatar` | Avatar object from 3.9 |
| `settings` | JSON audio settings defined below |
| `subscription` | JSON status, billing-provider references, and provider-confirmed `paid_through` timestamp |
| `archive_progress` | JSON object mapping puzzle IDs to arrays of distinct practice words |

### Audio settings

| Fields | Values | Initial value |
| --- | --- | --- |
| `music_volume` | Number from 0 through 100 | 50 |
| `effects_volume` | Number from 0 through 100 | 75 |
| `music_muted`, `effects_muted`, `master_muted` | Booleans | false |

## 3.5 Initial opponents

3.5.1 Save generated bots for reuse as opponent recordings.

3.5.2 The bot's name is `Guest` followed by three digits.

3.5.3 Generate bot moves with this procedure.

```text
function generate_bot_moves(puzzle, rules):
    pool = unique words in puzzle.word_list where
        word not in puzzle.wordoken_list and
        length(word) <= rules.bot_max_word_length and
        rarity(word) <= rules.bot_max_rarity
    elapsed_ms = 0
    moves = []
    while pool is not empty:
        elapsed_ms += random_integer(20000, 30000)
        if elapsed_ms >= 300000:
            break
        word = random_choice(pool)
        remove word from pool
        append {word, elapsed_ms} to moves
    return moves
```

| Bot setting | Initial value for playtesting |
| --- | --- |
| `bot_max_word_length` | 5 |
| `bot_max_rarity` | 0.25 |

3.5.4 Bot XP corresponds to level 1.

3.5.5 Display bot opponents like human opponents, using their saved snapshots.

## 3.6 Checks and indexes

3.6.1 Coin balances, coin shortfalls, and game-token balances cannot be negative.

3.6.2 Equipped items must be owned and fit their avatar slots.

3.6.3 Index `played_games(puzzle_id, difficulty, opponent_eligible)` for opponent searches.

3.6.4 Index `played_games(player_id, completed_at)` for archive searches.

3.6.5 Enforce 5.4.2 with a unique index on `lower(users.username)`.

3.6.6 Index `played_games(player_id, puzzle_id)` for repeat prevention.

3.6.7 Index `played_games(opponent_game_id, entry_type, completed_at, id)` for challenge results.

3.6.8 Enforce unique `(player_id, opponent_game_id)` for challenge records.

## 3.7 Database access

| Tables | Client reads | Writes |
| --- | --- | --- |
| `users` | Profile fields through 4.5 | Server code |
| `puzzles`, `words`, `played_games` | Through Section 4 calls | Server code |
| Tables in 3.11–3.15 | Owned data through Section 4 calls only | Server code |

## 3.8 Words (`words` table)

| Field | Contents |
| --- | --- |
| `word` | Unique word; primary key |
| `rarity` | Floating-point value |

3.8.1 Rarity ranges from 0 through 1, with 1 meaning rarest.

## 3.9 Avatars

| JSON field | Packed parts | Values | Guest default |
| --- | --- | --- | --- |
| `legs` | `Legs` | Item ID | `legs_black` |
| `torso` | `Torso` | Item ID | `torso_black` |
| `headwear` | `HeadBack`, plus `HeadFront` when supplied | Item ID or null | `bandana_red` |
| `skin` | `Skin` | Item ID | `skin_light` |
| `eyes` | `Eyes` | Item ID | `eyes_angry` |
| `weapon` | None; selects an attack action | `katana` or null | null |

3.9.1 Include every field, using null for empty equipment slots.

3.9.2 Initialize guest avatars with the defaults above.

3.9.3 Grant each non-null default item with inventory quantity one.

3.9.4 Generated bots use the guest default avatar.

Guest appearance source: [Figma avatar export](../design-reference/avatar.txt).

## 3.10 Avatar items and sprite bindings

3.10.1 Define avatar items in `content/catalog/avatar-items.json`.

| Item field | Contents |
| --- | --- |
| `id` | Stable item ID used by inventory and avatar selections |
| `slot` | Avatar equipment field from 3.9 |
| `appearance_id` | Reference to a sprite appearance; null for weapon items |
| `attack_action` | `Katana` for the katana weapon item; null for other items |
| `min_level` | Minimum confirmed level for acquisition |
| `subscription_required` | Whether acquisition requires an active subscription |
| `duplicate_coin_value` | Positive integer coin compensation for a duplicate chest award under 11.3.2 |

3.10.2 Define sprite appearances in `content/characters/appearances.json`.

| Appearance field | Contents |
| --- | --- |
| `id` | Stable appearance ID |
| `layers[]` | Bindings containing `source_character`, `part`, and `variant` |

### Available packed variants

| Source character | Part | Variants |
| --- | --- | --- |
| `Ninja` | `Eyes` | `Angry`, `Happy`, `Normal`, `Serious`, `Sleepy` |
| `Ninja` | `Skin` | `Dark`, `Light` |
| `Ninja` | `HeadBack` | `Blue`, `Green`, `Grey`, `Purple`, `Red`, `Yellow` |
| `Ninja` | `Torso`, `Legs` | `Black`, `Blue`, `Green`, `Grey`, `Purple`, `Red`, `Yellow` |
| `Samurai` | `HeadBack`, `HeadFront`, `Torso` | `Blue`, `Green`, `Purple`, `Red`, `Yellow` |
| `Samurai` | `Legs` | `Black` |

3.10.3 Each avatar part selects its own source character through its appearance binding.

3.10.4 Normalize `Yelllow` to `Yellow` in generated frame lookup keys.

3.10.5 Define the `katana` item with `slot = weapon` and the attack behavior in 9.3.

Packing source: [WO_Sprites1_merged.json](../technical-reference/logic/characters/Sprites/WO_Sprites1_merged.json).

Animation metadata: [Character references](../technical-reference/logic/characters/README.md#packing-json-inspection).

Layering reference: [SpriteTest.pde](../technical-reference/logic/characters/SpriteTest/SpriteTest.pde).

## 3.11 Play permits (`play_permits`)

| Field | Contents |
| --- | --- |
| `id` | UUID primary key |
| `player_id` | Owner linked to `users.id` |
| `device_id` | Installation holding the permit |
| `source` | `free`, `subscription`, or `token` |
| `grant_id` | Subscription refill UUID; null for other sources |
| `slot` | Integer 1–10 within a subscription grant; null for other sources |
| `expires_at` | Subscription permit expiry under 4.3.14; null for free and token permits |
| `paid_through` | Confirmed entitlement used for a subscription grant; null for other sources |
| `revoked_at` | Recovery or reversal timestamp; null while valid |
| `request_id` | Allocation request ID; null for local free grants |
| `issued_at` | Grant timestamp |
| `game_id` | Assigned game ID; null while unused |

3.11.1 Index permits by `(player_id, device_id, issued_at)`.

3.11.2 Enforce one assigned permit per game with a unique non-null `game_id`.

3.11.3 Enforce unique `(grant_id, slot)` for subscription permits.

## 3.12 Downloads (`game_downloads`)

| Field | Contents |
| --- | --- |
| `id` | Download request UUID; primary key |
| `player_id`, `device_id` | Recipient account and installation |
| `created_at` | Server timestamp |
| `issued_games` | Puzzle ID, opponent game ID, difficulty, and entry type for each issued bundle |
| `response` | Original download response for retries; nullable after retention under 13.3 |

3.12.1 Use `issued_games` to identify an upload's source without recalculating its match.

3.12.2 Index downloads by `(player_id, created_at)`.

## 3.13 Operation receipts (`operation_receipts`)

| Field | Contents |
| --- | --- |
| `id` | Receipt UUID; primary key |
| `player_id` | Owner linked to `users.id` |
| `operation`, `request_id` | Operation name and its retry identifier |
| `input` | Original submitted JSON |
| `result` | Saved response, awards, chest outcome, or reference to a download or order |
| `fulfillment_key` | Unique payment or subscription-cycle key; null for other operations |
| `created_at` | Server timestamp |

3.13.1 Enforce uniqueness on `(player_id, operation, request_id)` and each non-null `fulfillment_key`.

3.13.2 Save receipt outcomes and their database changes in the same transaction under 4.8.1.

## 3.14 Payment orders (`payment_orders`)

| Field | Contents |
| --- | --- |
| `id` | Order UUID; primary key |
| `player_id`, `request_id` | Owner and checkout request |
| `product` | Product and grant snapshot captured at checkout |
| `stripe_price_id`, `server_price`, `currency`, `currency_prices` | Price snapshot under 4.7.6 |
| `provider_checkout_id`, `provider_payment_id`, `provider_subscription_id` | Stripe references; null until available |
| `checkout_url` | Saved checkout destination |
| `status` | State from 4.7 |
| `customer_payment` | Actual paid amount and currency |
| `reversal_state` | Provider refund/dispute references, status, and net finalized reversal amount |
| `reversed_coins` | Coin grant already reversed under 11.8; initially zero |
| `created_at`, `updated_at` | Server timestamps |

3.14.1 Enforce uniqueness on `(player_id, request_id)` and each non-null checkout or payment ID.

3.14.2 Index orders by `(player_id, created_at)`.

## 3.15 Billing events (`billing_events`)

| Field | Contents |
| --- | --- |
| `id` | Stripe event ID; primary key |
| `player_id` | Resolved account owner |
| `order_id`, `subscription_id` | Related app order or provider subscription |
| `event_type` | Provider event type |
| `processed_at` | Server processing timestamp |

3.15.1 Record billing events in the transaction that applies their effects under 4.7.9.
