# 8. Recorded games, challenges, and archive

## 8.1 Recording playback

8.1.1 Reaching the last recorded move leaves the opponent idle until the new match ends.

8.1.2 Keep practice words out of recorded `moves`.

## 8.2 Sharing games

8.2.1 Allow sharing any completed human game accepted by the server, regardless of `opponent_eligible`.

8.2.2 Use a stable challenge URL at `/challenge/{game_id}` on the app's domain.

8.2.3 Offer the game's link on its postgame and archive screens after upload acceptance.

8.2.4 Copying a previously saved link works offline.

## 8.3 Accepting challenges

8.3.1 Allow challenges for previously played puzzles.

8.3.2 Challenge games use no play permits or game tokens.

8.3.3 Keep the incoming `game_id` through guest entry, sign-in, and registration.

8.3.4 Download the challenge through 4.2 using that ID as `opponent_game_id`.

8.3.5 Use screen 05C to show the recorded opponent's name, difficulty, and mode rules before the player starts the countdown.

8.3.6 A downloaded challenge can start offline.

8.3.7 Reject a challenge when its recording belongs to the caller.

8.3.8 Schedule the recording's `winning_knockout_ms` as its only knockout event in a challenge.

8.3.9 Associate that event with the recording's Wordoken at the saved timestamp.

8.3.10 A challenger knockout before that event wins; simultaneous knockouts tie under 7.8.

8.3.11 Without a recorded knockout win, the recorded opponent makes no knockout attempts in a challenge.

8.3.12 Ordinary opponents continue to roll knockout attempts under 7.5.

8.3.13 Allow one timed attempt per player and opponent recording, including active, pending, and completed attempts.

8.3.14 Reopening an attempted challenge resumes its active game or opens its archived result.

## 8.4 Archive entries

8.4.1 Add completed local games to the archive immediately.

8.4.2 Show upload status using the pending and rejected definitions in 4.4.

8.4.3 Merge local and server entries by `game_id` without duplicating rows.

8.4.4 Show rejected games separately from accepted and pending games.

8.4.5 Save downloaded archive pages and opened game bundles for offline access.

8.4.6 Opening an uncached puzzle requires internet access.

8.4.7 Archive entries show the saved result, final scores from 3.3, and current word-finding progress.

## 8.5 Archive practice

8.5.1 Opening an accepted or pending archived game starts untimed practice.

8.5.2 Save practice submissions with this procedure before updating the displayed progress.

```text
procedure save_practice_word(game, raw_word):
    word = validate_word(raw_word, game.bundle.puzzle)
    if word == invalid:
        return invalid
    atomic device(game.player_id, game.device_id):
        if word in practice_progress(game.puzzle_id).found_words:
            return already_found
        queued_practice_words[game.id].add(word)
        progress = practice_progress(game.puzzle_id)
        update_all_archive_entries(game.puzzle_id, progress)
    return progress
```

8.5.3 Apply successful practice replies with this procedure.

```text
procedure apply_practice_reply(request, reply):
    atomic device(request.player_id, request.device_id):
        puzzle_id = local_game(request.input.game_id).puzzle_id
        confirmed_found_words[puzzle_id] = set(reply.found_words)
        queued_practice_words[request.input.game_id].remove_all(request.input.words)
        save_rejected_words(reply.rejected_words)
        update_all_archive_entries(puzzle_id, practice_progress(puzzle_id))
```

8.5.4 Calculate puzzle completion with this function.

```text
function practice_progress(puzzle_id):
    puzzle = locally_stored_puzzle(puzzle_id)
    found = confirmed_found_words[puzzle_id] union
        words_in_pending_timed_games(puzzle_id) union
        queued_practice_words_for_puzzle(puzzle_id)
    found = found intersect set(puzzle.word_list)
    total = count(puzzle.word_list)
    require total > 0 else GAME_DATA_INCOMPLETE
    percentage = 100 * count(found) / total
    return {found_words = found, found_count = count(found), total_count = total,
            completion_percent = percentage, displayed_percent = floor(percentage)}
```

8.5.5 Send queued practice words through the synchronization sequence in 13.2.

8.5.6 Practice leaves the saved match result unchanged.

8.5.7 Practice works offline when the full puzzle bundle is stored on the device.

8.5.8 Practice runs no opponent playback or knockout attempts.

## 8.6 My Challenges

8.6.1 My Challenges opens `Overlay / Archive Challenges` for the viewed game.

8.6.2 List server-accepted games with `entry_type = challenge` and `opponent_game_id` matching the viewed game.

8.6.3 Show each challenger's recorded name and W, L, or T from that challenger's perspective.

8.6.4 Close dismisses the modal without clearing the current practice entry.

8.6.5 Save downloaded challenge results for offline viewing.

8.6.6 Scroll challenge rows vertically inside the modal.

Design references: [Archive](../design-reference/archive.txt) and [archive replay](../design-reference/replay.txt).

Prototype references: [05C Home / Incoming friend challenge](https://www.figma.com/design/QDpMK3iJTGBKWVloBv0p0f/Wordoken?node-id=548-4790) and [Overlay / Archive Challenges](https://www.figma.com/design/QDpMK3iJTGBKWVloBv0p0f/Wordoken?node-id=592-4792).
