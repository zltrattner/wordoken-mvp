# 0. Spec Control

| Field | Value |
| --- | --- |
| Status | Complete draft; release inputs in 0.4 |
| Revision | 0.64 |
| Updated | 2026-11-03 |

## 0.1 Coverage

0.1.1 This spec defines the MVP's client, server, database, and game rules.

## 0.2 Writing rules

0.2.1 Number requirements as section, subsection, and point.

0.2.2 Write one short sentence per point.

0.2.3 Name specific fields, files, actions, or values.

0.2.4 Define each rule once and reference its number elsewhere.

0.2.5 Keep each major section in a separate file.

0.2.6 For algorithms, list inputs, state, steps, outputs, and edge cases.

0.2.7 Attach language-neutral pseudocode to a numbered requirement.

0.2.8 An `atomic` block saves all its writes together or saves none on failure.

0.2.9 Nested atomic blocks share their parent's transaction.

0.2.10 Device blocks use the named player's installation data.

0.2.11 `request.input` contains submitted fields; other request fields hold session and queue metadata.

## 0.3 Sources

0.3.1 The [Figma exports](../design-reference/) take priority over the scope PDF when they conflict.

Scope PDF: [Wordoken Project Scope Outline](</C:/Users/zach/Downloads/Wordoken Project Scope Outline.docx.pdf>)

Technical sources: [Reference inventory](../technical-reference/README.md)

## 0.4 Release inputs

0.4.1 Supply the word-to-rarity dataset and the edited puzzle pool.

0.4.2 Supply prices and reward data for any additional products enabled under 11.7.

0.4.3 Complete the Stripe price display and provider event adapters in 11.7 and 11.8.

0.4.4 Review sprite impact markers and playback settings under 9.2.

0.4.5 Supply the audio choices and ad integration listed in 12.9.

0.4.6 Configure the domains, provider accounts, and credentials in 15.2.

## 0.5 Accepted decisions

0.5.1 Accept device-clock manipulation for the offline grants in 4.3.

0.5.2 Accept extra offline subscription plays under 11.5.14 for the MVP.

0.5.3 Trust recorded match outcomes under 4.4.8 despite the possibility of modified clients.

## 0.6 Change log

| Revision | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-23 | Separate front matter; combined architecture and code organization |
| 0.2 | 2026-10-23 | Added Section 1 scope draft |
| 0.3 | 2026-10-23 | Added word-building and game-token scope; shortened offline caching requirement |
| 0.4 | 2026-10-23 | Added Section 2 architecture, module boundaries, folder structure, and Swift port requirements |
| 0.5 | 2026-10-26 | Started Section 3 with puzzles and played games; removed game version requirements |
| 0.6 | 2026-10-26 | Added word rarities, opponent snapshots, bot fallback, user fields, checks, indexes, and access rules |
| 0.7 | 2026-10-26 | Added shared word rarity table and lookup; confirmed rarity direction and bot settings |
| 0.8 | 2026-10-26 | Added Section 4 outline and API-call template |
| 0.9 | 2026-10-26 | Drafted game-download request, response, errors, and retry behavior |
| 0.10 | 2026-10-26 | Set cache batches to 10 games and separated play-permit allocation |
| 0.11 | 2026-10-26 | Drafted permit allocation, token reservation, offline use, retry behavior, and storage fields |
| 0.12 | 2026-10-26 | Added rolling 24-hour free permits with offline grants and grant-time synchronization |
| 0.13 | 2026-10-26 | Specified recorded names, XP, and appearance snapshots; derived level from XP |
| 0.14 | 2026-10-26 | Drafted played-game uploads, verification, saved rewards, failure responses, and retries |
| 0.15 | 2026-10-27 | Completed Section 4 contracts and added user-row progress and receipt fields |
| 0.16 | 2026-10-27 | Reviewed Sections 0-4; shortened wording and gave repeated rules one owner |
| 0.17 | 2026-10-28 | Restored missing scope features and referenced account access from Section 4 |
| 0.18 | 2026-10-28 | Moved client generation to builds and removed the repeated schema location |
| 0.19 | 2026-10-28 | Clarified opponent selection, word points, scoring receipts, and reusable player recordings |
| 0.20 | 2026-10-28 | Removed stored game scores and rewards; clarified bot results and display |
| 0.21 | 2026-10-28 | Defined shared avatar fields, guest appearance, and default item grants |
| 0.22 | 2026-10-28 | Added packed avatar variants, item bindings, and sprite-data findings |
| 0.23 | 2026-10-28 | Corrected independent avatar-part selection and frame indexing from SpriteTest.pde |
| 0.24 | 2026-10-28 | Removed downloaded point values; specified scoring from letters, rarity, and Wordokens |
| 0.25 | 2026-10-28 | Reordered game preparation and permits; recorded accepted clock risk and clarified sync merging |
| 0.26 | 2026-10-28 | Reviewed Section 4; separated downloads and permits, settled offline rewards and free-play limits, and repaired upload and checkout retries |
| 0.27 | 2026-10-29 | Added puzzle editing status and restricted selection to edited puzzles |
| 0.28 | 2026-10-29 | Clarified server bundle storage and device retention in 4.2.8-4.2.9 |
| 0.29 | 2026-10-29 | Required free-grant synchronization before game uploads and removed upload grant fields |
| 0.30 | 2026-10-30 | Defined pending and rejected games before their use in Section 4.4 |
| 0.31 | 2026-10-30 | Added one shared offline message for actions requiring internet |
| 0.32 | 2026-10-30 | Changed the offline message to invite the player to play a game |
| 0.33 | 2026-10-30 | Clarified that the blocked action needs reconnection while games remain available offline |
| 0.34 | 2026-10-30 | Rewrote Section 4.8 with concrete request, retry, storage, and error instructions |
| 0.35 | 2026-10-30 | Added Section 5 with Google and email sign-in, guest progress rules, registered checkout, and two username changes per 30 days |
| 0.36 | 2026-10-31 | Added Section 6; set nine cached games, difficulty mapping, puzzle exclusions, and opponent eligibility |
| 0.37 | 2026-10-31 | Drafted Section 7 with rounded rarity bonuses, Wordoken scoring, knockout attempts, a probability proposal, and repeatable replay |
| 0.38 | 2026-11-01 | Accepted repeat puzzles for challenges and preserved the daily free play |
| 0.39 | 2026-11-01 | Drafted Section 8 with free challenges, shareable knockout games, offline practice, and challenge results; aligned database fields, permits, and APIs |
| 0.40 | 2026-11-01 | Verified prototype screen 05C and Archive Challenges overlay; linked both frames and aligned challenge results with the Player and Score columns |
| 0.41 | 2026-11-01 | Drafted Section 9 with layered sprites, equipped katana attacks, bounded attack playback, and knockout finishes; added avatar weapon selection |
| 0.42 | 2026-11-01 | Clarified shared atlas images, direct source-rectangle drawing, and frame lookups built once per avatar selection |
| 0.43 | 2026-11-01 | Replaced sprite drawing, frame lookup, and frame-position steps with numbered pseudocode blocks |
| 0.44 | 2026-11-01 | Converted permits, uploads, payments, retries, selection, game processing, practice, and animation scheduling to pseudocode; added partial progression and synchronization drafts |
| 0.45 | 2026-11-02 | Defined the shared level threshold table from the supplied algorithm, removed the level cap, set reward floors and zero-word awards, and made coin components conditional |
| 0.46 | 2026-11-02 | Defined hot streaks as consecutive game wins; left qualifying length and coin amount open |
| 0.47 | 2026-11-02 | Drafted Section 11 with product grants, coin purchases, chest opening, checkout recovery, subscriptions, and unresolved store settings |
| 0.48 | 2026-11-02 | Accepted initial mockup prices and the subscription allowance of 10 games per day; retained other store decisions |
| 0.49 | 2026-11-02 | Clarified that opening destroys the chest and displays awarded coins and items; removed the chest-result reopening rule |
| 0.50 | 2026-11-02 | Accepted immediate subscription allowance, rolling 24-hour refills capped at 10, separate daily free plays, and offline use through the confirmed paid-through date |
| 0.51 | 2026-11-02 | Accepted cancellation at the paid-through date, no renewal grace period, and continued ownership and use of acquired subscriber items |
| 0.52 | 2026-11-02 | Set small and large chest item counts, converted duplicates into catalog-defined coin amounts, and restricted rewards by level and subscription |
| 0.53 | 2026-11-02 | Selected Stripe with local-currency pricing, distinguished base and customer-paid amounts, and accepted the mockup purchase unlock levels |
| 0.54 | 2026-11-03 | Set USD as the Stripe base currency and the 500-coin pack to USD 1.99 or CAD 2.99; retained automatic conversion for other supported currencies |
| 0.55 | 2026-11-03 | Drafted Section 12 with screen navigation, word controls, manual tutorial entry, sound controls, and audio playback; set initial music and effects volumes to 50 and 75 |
| 0.56 | 2026-11-03 | Set each numbered countdown stage to one second and GO to half a second with word input enabled |
| 0.57 | 2026-11-03 | Excluded subscribers from ads and placed non-subscriber ads after Continue on results; left unavailable-ad behavior open |
| 0.58 | 2026-11-03 | Required direct navigation to Home when offline, when no ad is available, or when ad loading fails |
| 0.59 | 2026-11-03 | Set full-screen ads after at least three completed games, capped ad loading at two seconds, and saved account-specific ad progress on each device |
| 0.60 | 2026-11-03 | Recovered music and effect assignments from the scope outline, added transition and tally timing, and identified missing countdown audio and unresolved voice settings |
| 0.61 | 2026-11-03 | Applied review decisions for game lifecycle, reward reconciliation, streaks, challenge knockouts, KO and XP tuning controls, bots, item requirements, settings sync, offline recovery, and result presentation |
| 0.62 | 2026-11-03 | Reduced the ordinary cache to six games, accepted overlapping offline subscription use and client-verification limits, and saved final scores for archive display |
| 0.63 | 2026-11-03 | Made completed match records authoritative, retained user-row puzzle progress, defined operational tables, and added payment reversal and coin-shortfall rules |
| 0.64 | 2026-11-03 | Completed the spec draft with challenge-attempt limits, initial reward settings, subscription permits, recovery and retention, acceptance checks, and deployment procedures |
