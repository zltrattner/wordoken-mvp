# 14. Tests and acceptance checks

## 14.1 Test organization

14.1.1 Use Vitest for core and application tests, Playwright for browser flows, and local Supabase for database tests.

14.1.2 Store shared algorithm inputs and expected outputs in `test-vectors/` under 2.6.3.

14.1.3 Give each acceptance test the requirement number it checks.

14.1.4 Use controlled clocks, seeded randomness, and provider stubs for repeatable tests.

## 14.2 Game mechanics

14.2.1 Cover these cases with shared vectors.

| Rule | Cases |
| --- | --- |
| Word validation, 7.3 | Whitespace, capitalization, required letters, reusable letters, invalid words, and per-side duplicates |
| Scoring, 7.4 | Every example; rarity zero and one; values immediately around bonus boundaries |
| Clock, 7.2 | GO, background time, restored time, clock changes, and the final millisecond |
| Knockouts, 7.5–7.7 | Easy mode, before 1:00, exactly 1:00, zero timing coefficient, fixed seeds, and one attempt per Wordoken |
| Event ordering, 7.7 | Several submissions at one timestamp, simultaneous knockouts, and no moves after ending |
| Match ending, 7.8 | Win, loss, tie, timeout, and logical completion timestamps |
| Challenges, 8.3 | Recorded KO at 3:00; challenger KO just before, at, and after 3:00 |
| Levels, 10.3 | Each threshold minus one, at threshold, and above the bundled table |
| Rewards, 10.5–10.6 | Zero words, each difficulty, KO award, third consecutive win, tie reset, rounding, and disabled components |
| Bots, 3.5 | Unique eligible words, exhausted word pool, and no submissions at or after timeout |

14.2.2 Reproduce the five economy workbook cases using its inputs as test fixtures.

## 14.3 Database and request integrity

14.3.1 Run these checks against the migrated test database.

| Rule | Required check |
| --- | --- |
| Access, 3.7 | Another account cannot read or mutate private records |
| Uploads, 4.4 | Preserve recorded outcomes after changing scoring and knockout settings |
| Receipts, 4.8.1 | Repeated identical requests apply once; changed inputs with the same ID fail |
| Transactions, 0.2.8 | Failure between balance, record, and receipt writes leaves no partial changes |
| Permits, 3.11 | Concurrent uploads cannot consume one permit twice |
| Challenge attempts, 8.3.13 | Self-challenges and repeat attempts fail; a friend's challenge on an already-played puzzle succeeds |
| Puzzle cache, 6.3–6.4 | Two bundles per mode; partial refill; exclude active, cached, and completed puzzles |
| Practice, 8.5 | Union words across games and devices without losing accepted words after upload |

## 14.4 Offline and recovery flows

14.4.1 Exercise these flows with browser storage and network fault injection.

| Rule | Required check |
| --- | --- |
| Readiness, 13.4 | Offline start succeeds only with the required cached data and entitlement |
| Free plays, 4.3 | One unused permit; refill boundary at 24 hours; no accumulated missed days |
| Subscription, 4.3.14–4.3.16 | Refill ten, expire unused plays, retain separate free play, and upload after permit expiry |
| Multiple devices, 11.5.14 | Keep games and rewards from overlapping offline allowances |
| Synchronization, 13.2 | Grant synchronization precedes each funded upload |
| Lost replies, 13.1.3 | Confirmation removes pending estimates exactly once and preserves found-word progress |
| Storage failure, 13.4 | Failed start consumes nothing; failed move or result saves can recover |
| Multiple tabs, 13.1.6 | One game writer and one shared balance gate |
| Accounts, 13.1 | Switching accounts cannot send or display another account's queued data |
| Settings, 13.2.7 | Offline edits survive lost replies and later profile refreshes |
| Migration, 13.3 | Pending games, permits, settings, and immutable request IDs survive an update |

## 14.5 Accounts and purchases

14.5.1 Run provider-backed account and payment checks in staging.

| Rule | Required check |
| --- | --- |
| Registration, 5.2 | Email and Google linking preserve the guest ID and progress |
| Sign-in, 5.3 | Existing-account sign-in preserves account separation |
| Usernames, 5.4 | Concurrent name claims and two changes within rolling 30-day windows |
| Passwords, 5.6 | Reset links, confirmation mismatch, and incorrect current password |
| Coin purchases, 11.2 | Insufficient balance, price changes, ownership limits, and repeat requests |
| Chests, 11.3 | Consume once, show the saved roll, filter locked items, and convert duplicates |
| Checkout, 11.4 | Browser closes, creation reply disappears, delayed payment, and restored order lookup |
| Billing, 4.7.9 | Invalid signatures, duplicate events, out-of-order events, and one grant per paid cycle |
| Subscription, 11.5 | Activation, renewal, cancellation, unpaid expiry, and retained acquired items |
| Reversals, 11.8 | Partial-to-full refund, duplicate notifications, lost dispute, restored payment, and shortfall recovery |

## 14.6 Screens, sprites, and audio

14.6.1 Test the latest stable desktop Chrome, Firefox, Safari, and Edge available at release.

14.6.2 Test Safari on an iPhone and Chrome on an Android phone, including installed PWA mode.

14.6.3 Check navigation and word entry at 320 CSS-pixel width, desktop width, and with the mobile keyboard open.

14.6.4 Verify keyboard controls, visible focus, required-letter labels, and icon-button names under 12.1–12.3.

14.6.5 Preview every enabled avatar combination's layer bindings and required action sequences under Section 9.

14.6.6 Check muted audio, blocked playback, missing audio, background return, and replaced attack animations under 12.7.

14.6.7 Check that the first reward-screen tap reveals totals and a separate Continue input leaves under 12.4.

14.6.8 Check ad eligibility, subscriber exclusion, offline fallback, failure, timeout, and stale callbacks under 12.8.

## 14.7 Release acceptance

14.7.1 Require all automated checks to pass against the release commit.

14.7.2 Block release for crashes, lost committed games, incorrect balances, duplicate paid grants, or private-data access failures.

14.7.3 Complete one guest game, offline game, challenge, practice session, registration, and test purchase on staging.

14.7.4 Record the release commit, tested devices, unresolved presentation defects, and completed checks.

14.7.5 Verify production startup and challenge links after deployment through 15.3.
