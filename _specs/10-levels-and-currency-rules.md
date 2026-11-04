# 10. Levels and currency rules

## 10.1 Calculation inputs

10.1.1 Use the tunable initial reward settings in 10.4.

10.1.2 Count Wordokens by matching recorded words to the puzzle's fixed `wordoken_list`.

| Calculation | Inputs | Output |
| --- | --- | --- |
| `calculate_rewards` | Recorded match fields from 3.3, XP before the award, opponent snapshot, streak after this game | XP and gross coin awards under 10.5 and 10.6 |
| `displayed_balances` | Confirmed balances and pending games | Displayed XP and coins |
| `level_for_xp` | XP and the threshold table in 10.3 | Player level |

## 10.2 Displayed balances

10.2.1 Calculate displayed balances with this function.

```text
function displayed_balances():
    pending = local games with status == pending
    return {
        xp = confirmed.xp + sum(game.estimated_rewards.xp for game in pending),
        coins = confirmed.coins + max(0,
            sum(game.estimated_rewards.coins for game in pending) - confirmed.coin_shortfall)
    }
```

10.2.2 Calculate the displayed level by passing displayed XP to 10.3.1.

10.2.3 Recalculate pending estimates after confirmations, rejections, or local game completion with this procedure.

```text
procedure recalculate_pending_rewards_under_10_2_3():
    xp = confirmed.xp
    streak = confirmed.win_streak
    for game in pending games ordered by local completion, then game_id:
        streak = streak_after(streak, game.result)
        game.estimated_rewards = calculate_rewards(game, xp,
            game.bundle.opponent.player_snapshot, streak)
        xp += game.estimated_rewards.xp
```


## 10.3 Level lookup

10.3.1 Calculate levels from the threshold table with this function.

```text
function level_for_xp(xp, thresholds):
    thresholds = extend_thresholds(xp, thresholds)
    require thresholds is not empty and xp >= first(thresholds).min_xp
    level = first(thresholds).level
    for threshold in thresholds ordered by min_xp:
        if xp < threshold.min_xp:
            break
        level = threshold.level
    return level
```

10.3.2 Threshold rows contain consecutive `level` values and strictly increasing `min_xp` totals.

10.3.3 Store the shared threshold table in `content/rules/progression.json`.

10.3.4 Bundle this file with the browser and server for identical offline and online calculations.

10.3.5 Generate the initial table from the supplied algorithm with this function.

```text
function initial_thresholds(highest_level):
    require highest_level >= 1
    rows = [{level = 1, min_xp = 0}]
    for level from 2 through highest_level:
        append {level, min_xp = default_min_xp(level)} to rows
    return rows

function default_min_xp(level):
    require level >= 2
    n = (level - 1) * 10
    return n * (n - 1) / 2
```

| Level | Minimum total XP |
| --- | --- |
| 1 | 0 |
| 2 | 45 |
| 3 | 190 |
| 4 | 435 |
| 5 | 780 |

10.3.6 Extend the table without a level cap using this function.

```text
function extend_thresholds(xp, thresholds):
    require thresholds starts with {level = 1, min_xp = 0}
    require thresholds satisfies 10.3.2
    rows = copy(thresholds)
    while xp >= last(rows).min_xp:
        next_level = last(rows).level + 1
        next_min_xp = default_min_xp(next_level)
        require next_min_xp > last(rows).min_xp
        append {level = next_level, min_xp = next_min_xp} to rows
    return rows
```

## 10.4 Initial reward settings

10.4.1 Store these values in `content/rules/progression.json`.

| Setting | Initial value |
| --- | --- |
| XP adjustment coefficient `k` | 10 |
| Participation XP | 5 |
| XP multiplier: Easy / Medium / Hard | 1 / 1.25 / 1.5 |
| Knockout-win XP | 50 |
| Coins per score point | 0.1 |
| Victory coins | 5 |
| Coins per Wordoken | 2 |
| Hot-streak coins | 5 |
| Hot-streak minimum | 3 consecutive wins |
| Fast-knockout coins | 10 |
| Fast-knockout threshold | Before 180000 ms |
| Level multiplier | Disabled; factor 1 |

10.4.2 Keep the level thresholds in 10.3 while tuning reward amounts.

10.4.3 Treat these settings as the initial playtest baseline.

## 10.5 XP and award limits

10.5.1 Calculate base XP with this function using the settings in 10.4.

```text
function base_xp(score, result, player_level, opponent_level, k, participation):
    p = 1 / (1 + power(10, (sqrt(player_level) - sqrt(opponent_level)) / 10))
    scale = k * sqrt(player_level)
    if result == win:
        adjustment = scale * p
    else if result == loss:
        adjustment = -scale * (1 - p)
    else:
        adjustment = scale * (p - 0.5)
    return score + participation + adjustment
```

Source: [XP and level sketch](<../technical-reference/logic/progression/xp and level algorithm.js>).

10.5.2 Finalize game rewards with this function.

```text
function finalize_rewards(accepted_word_count, raw_xp, coins):
    if accepted_word_count == 0:
        return {xp = 0, coins = 0}
    return {xp = max(0, floor(raw_xp + 0.5)), coins}
```

10.5.3 Multiply the unrounded game XP by its difficulty multiplier, then add the knockout-win XP award before 10.5.2.

10.5.4 Calculate rewards with this function.

```text
function calculate_rewards(game, xp_before, opponent_snapshot, streak_after_game):
    rules = current_progression_rules()
    level = level_for_xp(xp_before, rules.thresholds)
    opponent_level = level_for_xp(opponent_snapshot.xp, rules.thresholds)
    wordokens = count(move.word in puzzle(game.puzzle_id).wordoken_list for move in game.moves)
    knockout_win = game.result == win and game.end_reason == knockout
    raw_xp = base_xp(game.final_score, game.result, level, opponent_level,
                     rules.k, rules.participation_xp) * rules.difficulty_xp_multiplier[game.difficulty]
    if knockout_win:
        raw_xp += rules.knockout_win_xp
    coins = coin_award_under_10_6_6(game, wordokens, streak_after_game, rules)
    return finalize_rewards(count(game.moves), raw_xp, coins)
```

## 10.6 Conditional coin rewards

10.6.1 Award each enabled coin component only when its player and game conditions are met.

| Component | Required condition |
| --- | --- |
| Word Score | Player earns word points |
| Victory | Player wins the match |
| Hot Streak Bonus | Streak in 10.6.2 reaches the minimum in 10.4 |
| Level Multiplier | Enabled level rule; disabled initially under 10.4 |
| Wordoken Bonus | Player submits at least one accepted Wordoken |
| Fast KO Bonus | Player wins by knockout before the threshold in 10.4 |

10.6.2 Update the streak for each accepted timed game with this function.

```text
function streak_after(previous, result):
    return previous + 1 if result == win else 0
```

10.6.3 Assign increasing `reward_sequence` values in server acceptance order while holding the account lock.

10.6.4 Use the streak including the current game for its bonus eligibility.

10.6.5 Practice and rejected uploads leave the confirmed streak unchanged.

10.6.6 Add applicable coin components, apply enabled multipliers, and round once with this function.

```text
function coin_award_under_10_6_6(game, wordokens, streak, rules):
    coins = game.final_score * rules.coins_per_score_point
    if game.result == win:
        coins += rules.victory_coins
        if streak >= rules.hot_streak_minimum:
            coins += rules.hot_streak_coins
    coins += wordokens * rules.coins_per_wordoken
    if game.result == win and game.end_reason == knockout and
            milliseconds(game.completed_at - game.started_at) < rules.fast_knockout_ms:
        coins += rules.fast_knockout_coins
    return max(0, floor(coins * rules.level_multiplier + 0.5))
```
