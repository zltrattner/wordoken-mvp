# 7. Game engine

## 7.1 Match inputs and state

| Input | Contents |
| --- | --- |
| Downloaded bundle | Difficulty, puzzle, word rarities, opponent snapshot, and opponent moves from 4.2 |
| `player_snapshot` | Player identity captured at GO under 3.3 |
| `rules` | Word-scoring and knockout parameters from 7.4 and 7.6 |
| `knockout_seed` | Server-generated string of 32 lowercase hexadecimal characters |

| State for each player | Initial value |
| --- | --- |
| `score` | 0 |
| `found_words` | Empty set |
| `attacks_landed` | 0 |
| `wordokens_found` | 0 |
| `knocked_out` | `false` |
| `moves` | Empty list |

| Match state | Initial value |
| --- | --- |
| `ended` | false |
| `result`, `end_reason`, `end_elapsed_ms`, `triggering_word` | null |

7.1.1 Copy active scoring and knockout parameters from `content/rules/game.json` into each downloaded bundle's `rules`.

7.1.2 Use those saved parameters throughout the active match and any device restoration.

## 7.2 Clock and start time

7.2.1 The five-minute clock starts at GO, after the countdown.

7.2.2 Measure live elapsed time with a clock unaffected by changes to the device's calendar time.

7.2.3 The timer continues while the app is backgrounded or closed.

7.2.4 Restore the clock and match state with this procedure before accepting new input.

```text
procedure restore_match(saved_game, device_now, monotonic_now):
    elapsed_ms = max(0, saved_game.last_elapsed_ms,
                     milliseconds(device_now - saved_game.started_at))
    state = replay_match(saved_game.bundle, saved_game.moves, elapsed_ms)
    clock_anchor = {elapsed_ms, monotonic_now}
    return {state, clock_anchor}
```

7.2.5 During live play, set elapsed time to the anchor's elapsed time plus the monotonic-clock difference.

## 7.3 Word submissions

7.3.1 Validate words for timed games and practice with this function.

```text
function validate_word(raw_word, puzzle):
    word = lowercase(trim(raw_word))
    if word not in puzzle.word_list:
        return invalid
    if any(letter not in word for letter in puzzle.fixed_letters):
        return invalid
    return word
```

7.3.2 Words may reuse any available letter.

7.3.3 Apply a timed submission with this function.

```text
function accept_submission(state, side, raw_word, elapsed_ms):
    word = validate_word(raw_word, state.bundle.puzzle)
    fighter = state[side]
    if state.ended or elapsed_ms < 0 or elapsed_ms >= 300000 or word == invalid:
        return rejected
    if word in fighter.found_words:
        return rejected
    is_wordoken = word in state.bundle.puzzle.wordoken_list
    fighter.found_words.add(word)
    fighter.score += points_under_7_4(word, state.bundle)
    fighter.attacks_landed += 1
    if is_wordoken:
        fighter.wordokens_found += 1
    append {word, elapsed_ms} to fighter.moves
    return {word, is_wordoken, elapsed_ms}
```

## 7.4 Word points

7.4.1 A word's base points equal its letter count.

7.4.2 Multiply base points by two for words in `wordoken_list`.

7.4.3 Calculate `rarity_bonus = ceil(4 * rarity)`, rounding upward to a whole point.

7.4.4 Add the rarity bonus after applying the Wordoken multiplier.

7.4.5 Add the resulting word points to the submitting player's score.

| Example | Word points |
| --- | --- |
| Five-letter ordinary word; rarity 0 | 5 |
| Five-letter ordinary word; rarity 0.25 | 6 |
| Five-letter ordinary word; rarity 0.4 | 7 |
| Five-letter ordinary word; rarity 0.5 | 7 |
| Five-letter ordinary word; rarity 1 | 9 |
| Six-letter Wordoken; rarity 0.5 | 14 |
| Eight-letter Wordoken; rarity 1 | 20 |

| Calculated field | Contents |
| --- | --- |
| `score_breakdown.base_points` | Sum of accepted word lengths |
| `score_breakdown.wordoken_bonus` | Extra points added by the Wordoken multiplier |
| `score_breakdown.rarity_bonus` | Sum of rounded rarity bonuses |
| `score` | Sum of the three components above |

## 7.5 Knockout attempts

7.5.1 Evaluate each accepted submission once with this function after 7.3.3 updates its counters.

```text
function knockout_succeeds(state, side, accepted):
    if side == opponent and state.bundle.entry_type == challenge:
        return false
    if state.bundle.difficulty == easy or not accepted.is_wordoken:
        return false
    if accepted.elapsed_ms < 60000:
        return false
    fighter = state[side]
    chance = knockout_chance(accepted.elapsed_ms,
        fighter.attacks_landed, fighter.wordokens_found,
        count(set(state.bundle.puzzle.wordoken_list)), state.bundle.rules)
    roll = knockout_roll(state.bundle.knockout_seed, side, fighter.wordokens_found)
    return roll < chance
```

7.5.2 Wordokens evaluated before 60 seconds receive no later attempt.

## 7.6 Initial knockout probability proposal

7.6.1 Treat the numerical weights below as initial values for playtesting.

| Input | Meaning |
| --- | --- |
| `H` | Attacker's landed attacks, including the current word |
| `W` | Attacker's distinct Wordokens found, including the current word |
| `T` | Number of distinct words in the puzzle's `wordoken_list` |

| Elapsed time checkpoint | `time_factor` |
| --- | --- |
| 1:00 | 0 |
| 2:30 | 0.25 |
| 5:00 | 1 |

| Rule parameter | Initial value |
| --- | --- |
| `timing_coefficient` | 0 |
| `attack_coefficient` | 1 |
| `attack_target` | 10 |
| `wordoken_base` | 0.10 |
| `coverage_weight` | 0.40 |
| `wordoken_weight` | 0.10 |
| `wordoken_cap` | 5 |
| `chance_cap` | 0.90 |

7.6.2 Calculate the probability with the saved parameters and time checkpoints using this function.

```text
function knockout_chance(elapsed_ms, H, W, T, rules):
    left, right = adjacent_time_checkpoints(elapsed_ms, rules.time_checkpoints)
    fraction = (elapsed_ms - left.ms) / (right.ms - left.ms)
    time_factor = left.factor + fraction * (right.factor - left.factor)
    time_factor = 1 - rules.timing_coefficient + rules.timing_coefficient * time_factor
    attack_factor = 1 - rules.attack_coefficient + rules.attack_coefficient * min(H / rules.attack_target, 1)
    coverage = W / T
    wordoken_factor = rules.wordoken_base + rules.coverage_weight * coverage +
        rules.wordoken_weight * min(W, rules.wordoken_cap)
    return min(rules.chance_cap, time_factor * attack_factor * wordoken_factor)
```

7.6.3 Timing and attack coefficients range from zero to one, with zero removing that factor's influence.

7.6.4 The one-minute knockout restriction in 7.5 remains independent of the timing coefficient.

| Time of Wordoken | Landed attacks | Wordokens found / available | Initial chance |
| --- | --- | --- | --- |
| 0:45 | 10 | 1 / 1 | 0% |
| 1:30 | 3 | 3 / 10 | 15.6% |
| 1:30 | 10 | 3 / 10 | 52% |
| 2:30 | 10 | 1 / 1 | 60% |
| 4:00 | 10 | 5 / 10 | 80% |

## 7.7 Opponent playback and repeatable random rolls

7.7.1 Advance the match with this procedure, consuming each queued submission once.

```text
procedure advance_match(state, elapsed_ms, queued_submissions, final_batch_is_closed = false):
    closed_through = elapsed_ms if final_batch_is_closed else elapsed_ms - 1
    due = queued_submissions where unprocessed and move.elapsed_ms <= min(closed_through, 299999)
    if state.bundle.entry_type == challenge and state.bundle.opponent.winning_knockout_ms is not null:
        add the unprocessed scheduled knockout under 8.3.8 to due when its time <= closed_through
    for batch in due grouped by elapsed_ms, earliest first:
        if state.ended:
            break
        knockout_events = empty_list()
        accepted_events = empty_list()
        for side in [player, opponent]:
            for move in batch[side] with type = submission, in original list order:
                mark move as processed
                accepted = accept_submission(state, side, move.word, batch.elapsed_ms)
                if accepted != rejected:
                    event = {attacker = side, defender = other_side(side),
                             word = accepted.word, is_wordoken = accepted.is_wordoken,
                             elapsed_ms = batch.elapsed_ms}
                    append event to accepted_events
                    if knockout_succeeds(state, side, accepted):
                        append event to knockout_events
        if batch contains the scheduled challenge knockout:
            mark that event processed
            append its opponent attack event to knockout_events
        resolve_ending(state, batch.elapsed_ms, knockout_events)
        expose accepted_events and any ending as this batch's output
    if elapsed_ms >= 300000 and not state.ended:
        resolve_ending(state, 300000, empty_list())
        expose the timeout ending as advancement output
```

7.7.2 In live play, close a timestamp's batch after the clock advances beyond that millisecond.

7.7.3 Calculate the repeatable roll with this function, using `side` as `player` or `opponent`.

```text
function knockout_roll(seed, side, wordoken_number):
    text = seed + ":" + side + ":" + decimal(wordoken_number)
    hash = sha256_hex(utf8(text))
    return unsigned_hex_integer(hash[0:8]) / 4294967296
```

7.7.4 Replay saved games with this function, closing the supplied final timestamp's batch.

```text
function replay_match(bundle, player_moves, elapsed_ms):
    state = initial_state_under_7_1(bundle)
    queued = player_moves and bundle.opponent.moves, tagged as submissions with side and list order
    advance_match(state, elapsed_ms, queued, final_batch_is_closed = true)
    return state
```

## 7.8 Match ending and result

7.8.1 Determine match endings with this procedure.

```text
procedure resolve_ending(state, elapsed_ms, knockout_events):
    if state.ended:
        return
    knocked_out = set(event.defender for event in knockout_events)
    for side in knocked_out:
        state[side].knocked_out = true
    if knocked_out == {player, opponent}:
        result = tie
    else if player in knocked_out:
        result = loss
    else if opponent in knocked_out:
        result = win
    else if elapsed_ms == 300000:
        result = compare_scores(state.player.score, state.opponent.score)
    else:
        return
    state.ended = true
    state.result = result
    state.end_reason = knockout if knocked_out is not empty else timeout
    state.end_elapsed_ms = elapsed_ms
    state.triggering_word = first(knockout_events) if knockout_events is not empty else null
```

7.8.2 Score comparison returns win for a higher player score, loss for a lower score, and tie for equal scores.

7.8.3 Set `completed_at = started_at + end_elapsed_ms`.

7.8.4 Queue the finished game through 4.4 when the match ends.

| Engine output | Contents |
| --- | --- |
| Scores | Final score and breakdown for each player |
| Knockout flags | Each player's final `knocked_out` value |
| `end_elapsed_ms` | First knockout timestamp, or 300000 for timeout |
| `end_reason` | `timeout` or `knockout` |
| `result` | Local player's `win`, `loss`, or `tie` |
| `triggering_word` | First successful knockout event at match end; null on timeout |
