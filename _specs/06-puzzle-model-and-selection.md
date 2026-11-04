# 6. Puzzle model and selection

## 6.1 Puzzle eligibility

6.1.1 Include puzzles with `edited = true` in the selection pool.

6.1.2 Before download, check puzzle data under 3.2 and word rarities under 3.8.

6.1.3 Every required letter must occur in `all_letters`.

## 6.2 Difficulty

6.2.1 Derive difficulty from the number of letters in `all_letters` using the table below.

| Difficulty | Available letters | Required letters |
| --- | --- | --- |
| `easy` | 6 | 1 |
| `medium` | 7 | 1 |
| `hard` | 8 | 2 |

6.2.2 The number of `fixed_letters` must match the mode's required-letter count.

## 6.3 Offline cache

6.3.1 Keep six unstarted ordinary game bundles: two for each difficulty.

6.3.2 Calculate refill counts with this function.

```text
function refill_counts(cached_bundles):
    counts = empty_map()
    for mode in [easy, medium, hard]:
        present = count(cached_bundles where
            entry_type == ordinary and status == unstarted and difficulty == mode)
        counts[mode] = max(0, 2 - present)
    return counts
```

6.3.3 Run 13.2.6 after starting an ordinary game and after reconnection.

6.3.4 Leave unfilled slots empty when the server returns fewer bundles under 4.2.4.

## 6.4 Puzzle selection and repeat prevention

6.4.1 Select ordinary puzzles with this function.

```text
function select_puzzles(player_id, counts, exclude_puzzle_ids):
    played = puzzle_ids from played_games where player_id matches
    excluded = set(played) union set(exclude_puzzle_ids)
    selected = empty_list()
    for mode in [easy, medium, hard]:
        pool = puzzles passing 6.1 and 6.2 where
            difficulty == mode and id not in excluded
        chosen = random_sample_without_replacement(pool, up_to = counts[mode])
        append chosen to selected
        excluded = excluded union set(chosen.ids)
    return selected
```

6.4.2 Supply cached, active, and locally completed puzzle IDs as `exclude_puzzle_ids`.

## 6.5 Random opponent recordings

6.5.1 Set opponent eligibility from each accepted game with this function.

```text
function opponent_eligible(game):
    knocked_out = game.end_reason == knockout and game.result in [loss, tie]
    return not knocked_out and any(move.elapsed_ms >= 180000 for move in game.moves)
```

6.5.2 Ineligible recordings retain their archive entries and normal rewards.

6.5.3 Select the ordinary opponent with this function.

```text
function select_opponent(caller_id, puzzle_id, difficulty):
    humans = played_games matching puzzle_id and difficulty where
        is_bot == false and opponent_eligible == true and player_id != caller_id
    if humans is not empty:
        return random_choice(humans)
    bots = played_games matching puzzle_id and difficulty where is_bot == true
    if bots is not empty:
        return random_choice(bots)
    return generate_bot_under_3_5(puzzle_id, difficulty)
```
