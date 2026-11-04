# 12. Screens, controls, and audio

## 12.1 Screens and navigation

12.1.1 Use the local exports below for screen layouts and labels.

| Screen | Export | Actions and behavior |
| --- | --- | --- |
| Start | [start.txt](../design-reference/start.txt) | Enter as a guest or open sign-in under Section 5 |
| Home | [home.txt](../design-reference/home.txt) | Select difficulty, open How to Play, or start a game |
| Countdown | [countdown.txt](../design-reference/countdown.txt) | Prepare the player before GO under 12.2 |
| Gameplay | [easy.txt](../design-reference/easy.txt), [medium.txt](../design-reference/medium.txt), [hard.txt](../design-reference/hard.txt) | Enter words through 12.3 and display match state through 12.4 |
| Results | [postwin.txt](../design-reference/postwin.txt), [postloss.txt](../design-reference/postloss.txt), [posttie.txt](../design-reference/posttie.txt) | Display the result, rewards, challenge action, and Continue |
| Archive and practice | [archive.txt](../design-reference/archive.txt), [replay.txt](../design-reference/replay.txt) | Open saved games under Section 8 |
| Store and plans | [store.txt](../design-reference/store.txt), [subscribe.txt](../design-reference/subscribe.txt), [activeplan.txt](../design-reference/activeplan.txt) | Use the purchase and subscription flows in Section 11 |
| Settings | [settings.txt](../design-reference/settings.txt) | Open avatar, account, subscription, and sound controls |
| Avatar | [avatar.txt](../design-reference/avatar.txt) | Save the draft through 4.5 or discard it with Cancel |
| Account forms | [signin.txt](../design-reference/signin.txt), [signup.txt](../design-reference/signup.txt), [changepassword.txt](../design-reference/changepassword.txt) | Use the account rules in Section 5 |
| Sound | [sound.txt](../design-reference/sound.txt) | Apply controls under 12.6 |

12.1.2 Use Home, Archive, Store, and Settings as the bottom navigation destinations shown in the exports.

12.1.3 Center the game column on wider windows while keeping its controls within the viewport.

12.1.4 Give icon buttons accessible names and visible keyboard focus indicators.

## 12.2 Game preparation

12.2.1 Show difficulty rules from Section 6 on Home and the incoming challenge screen.

12.2.2 Begin countdown only when 13.4.1 confirms the selected game is ready.

12.2.3 Show 3, 2, 1, and GO, with GET READY below the numbered stages.

12.2.4 At GO, call `start_game` under 4.3.5 before enabling word submissions.

12.2.5 Show the missing puzzle, asset, storage, or permit requirement when preparation cannot finish.

12.2.6 Use these countdown display timings.

| Display | Duration | Word input |
| --- | --- | --- |
| 3 | 1,000 ms | Disabled |
| 2 | 1,000 ms | Disabled |
| 1 | 1,000 ms | Disabled |
| GO | 500 ms | Enabled after 4.3.5 succeeds |

## 12.3 Word controls

12.3.1 Apply these controls to timed games and archive practice.

| Control | Action |
| --- | --- |
| Tap a letter tile | Append that letter to the entry |
| Type an available letter | Append that letter while the word entry has keyboard focus |
| Backspace button or key | Delete the final entered letter |
| Clear | Empty the entry |
| Shuffle | Rearrange tile positions while preserving the puzzle and entry |
| Submit or Enter | Queue a timed submission for 7.7.1 or save a practice submission through 8.5.2 |

12.3.2 Clear the entry after an accepted submission.

12.3.3 Keep rejected entries visible for editing.

12.3.4 Show invalid-word and already-found feedback beside the entry.

12.3.5 Mark required tiles with red styling and an accessible required-letter label.

## 12.4 Match and result displays

12.4.1 Display fighter names, levels, and appearances from the game's saved snapshots.

12.4.2 Format remaining game time as `mm:ss`, rounding remaining seconds upward.

12.4.3 Show the player's accepted words in the horizontally scrollable found-word tray.

12.4.4 Update scores and word feedback from accepted game events under 7.7.1.

12.4.5 Open results through the ending and restoration procedures in Section 9.

12.4.6 Display calculated rewards under Section 10 using only applicable coin components from 10.6.

12.4.7 Label pending reward estimates until the upload reply confirms them under 4.4.

12.4.8 Use the challenge-sharing conditions in 8.2 for the result screen's Copy Link action.

12.4.9 Continue returns to Home.

12.4.10 Each accepted word produces its score gain and chime even when its attack animation is replaced under 9.4.

12.4.11 The first click or tap anywhere during reward animations reveals all totals and consumes that input.

12.4.12 Continue requires a separate input after the totals are revealed.

## 12.5 How to Play

12.5.1 Open How to Play only when the player selects it.

12.5.2 Present the exported tutorial pages in this order.

| Order | Heading | Export |
| --- | --- | --- |
| 1 | Select Difficulty | [tutorialwords.txt](../design-reference/tutorialwords.txt) |
| 2 | Make Words | [tutorialmode.txt](../design-reference/tutorialmode.txt) |
| 3 | Score More Points | [tutorialcontrols.txt](../design-reference/tutorialcontrols.txt) |
| 4 | Challenge Friends | [tutorialscoring.txt](../design-reference/tutorialscoring.txt) |

12.5.3 Previous and Next move between adjacent pages.

12.5.4 Disable Previous on the first page and Next on the final page.

12.5.5 Exit returns to the screen that opened the tutorial.

12.5.6 Derive tutorial numbers and difficulty descriptions from Sections 6 and 7.

## 12.6 Sound controls

12.6.1 The top-right speaker toggles `master_muted` while preserving each channel's volume and mute setting.

12.6.2 Calculate channel volume with this function using the fields and defaults in 3.4.

```text
function audio_gain(settings, channel):
    require channel in [music, effects]
    if settings.master_muted or settings[channel + "_muted"]:
        return 0
    return settings[channel + "_volume"] / 100
```

12.6.3 Save and synchronize sound changes through 13.2.7.

12.6.4 Done closes Sound Settings with the current settings applied.

## 12.7 Audio playback

12.7.1 Define `content/audio/events.json` from these mappings and the supplied [audio inventory](../technical-reference/audio/README.md).

| Screen group | Music | Playback |
| --- | --- | --- |
| Menu and account screens | `Music1.mp3` | Play the intro once, then loop the main body |
| Timed gameplay from GO | `Music2.mp3` | Play once; stop when the engine ends the match under 7.8 |
| Results | `Music3.mp3` | Loop while results remain open |

| Event | Effect |
| --- | --- |
| External social link | None |
| Start Game, Sign In, Sign Up, avatar Save, Change Password, or results Continue | `Shing1.mp3` |
| Difficulty change, store product selection, or avatar selection change | `Smack1.mp3` |
| Gameplay button or letter tile | `Click1.mp3` |
| Sound Settings button | `Chime1.mp3` |
| Other menu navigation | `Whoosh1.mp3` |
| Punch action starts | `Ha1.mp3` for Voice1; `Ha2.mp3` for Voice2 |
| Kick action starts | `Hiya1.mp3` for Voice1; `Hiya2.mp3` for Voice2 |
| Katana action starts | `Hahahiya1.mp3` for Voice1; `Hahahiya2.mp3` for Voice2 |
| Accepted-word score gain under 12.4.10 | `Chime1.mp3` |
| Winning result screen opens | `Cheer1.mp3` |
| Reward tally row appears | `Tally1.mp3` |
| Countdown animation | `Countdown1`; asset missing under 12.9 |

12.7.2 Attempt audio playback after a player interaction permits it.

12.7.3 Keep navigation and gameplay available when audio is blocked or unavailable.

12.7.4 Play at most one music track at a time.

12.7.5 Trigger impact effects at the animation markers processed under 9.4.3.

12.7.6 Stop audio while the app is hidden and resume the current screen's music when playback is permitted.

12.7.7 Discard missed effects when returning from the background.

12.7.8 Cache selected audio files for offline playback.

12.7.9 Preserve Music1's playback position when moving between menu screens.

12.7.10 Apply the first matching button-effect mapping in table order.

12.7.11 Apply these music transitions to the gain calculated in 12.6.2.

| Transition | Music behavior |
| --- | --- |
| Navigation between Music1 screens | Fade to half the current gain, then restore it on the destination screen |
| Begin the pregame countdown | Fade Music1 out |
| Continue from results | Fade Music3 out |

12.7.12 Reveal applicable reward tally rows at two-second intervals.

Source: [Scope outline](</C:/Users/zach/Downloads/Wordoken Project Scope Outline.docx.pdf>), Sound Design on pages 2-17.

Browser reference: [Media and Web Audio autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

## 12.8 Ads

12.8.1 Show ads only to non-subscribers after they select Continue on the results screen.

12.8.2 Open Home when offline, when no ad is available, or when the ad fails to load.

12.8.3 Use these ad settings.

| Setting | Value |
| --- | --- |
| Format | Full-screen |
| Frequency | At least three completed timed games since the previous displayed ad |
| Initial completed-game count | Zero |
| Maximum loading wait | 2,000 ms after Continue, then open Home |

12.8.4 Count each completed timed game once per `game_id` in the device's account-specific ad progress.

12.8.5 Reset the completed-game count when an ad opens.

12.8.6 Ignore ad-ready callbacks after the loading timeout or navigation away from results.

12.8.7 Open Home when the ad closes.

## 12.9 Decisions still required

12.9.1 Set these remaining presentation choices before implementing their playback or placement.

| Decision | Required settings |
| --- | --- |
| Audio timing | Music1 loop boundaries and exact fade durations after listening |
| Voice selection | How Voice1 or Voice2 is selected, captured in snapshots, and assigned to guests |
| Countdown audio | Missing `Countdown1` asset and alignment with 12.2.6 |
| Sound Settings music | Clarify the scope outline's button-triggered fade-out and when music returns |
| Ad integration | Provider and playback integration |
