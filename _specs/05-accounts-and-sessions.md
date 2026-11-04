# 5. Accounts and sessions

## 5.1 Account types

5.1.1 The MVP supports email/password and Google sign-in through Supabase Auth.

5.1.2 Guests use Supabase anonymous accounts with their own `player_id`.

5.1.3 Create one `users` row for each new Supabase account.

5.1.4 Registered accounts have a verified email or Google identity and `is_anonymous = false`.

5.1.5 Assign guests a unique username consisting of `Guest` followed by digits.

5.1.6 Guests cannot recover their account after signing out, clearing browser data, or moving to another device.

## 5.2 Registering a guest account

5.2.1 Attach the new sign-in method to the existing guest account, keeping its `player_id`.

5.2.2 Preserve games, XP, coins, tokens, permits, inventory, settings, and practice progress during registration.

5.2.3 Email registration verifies the address through Supabase before setting the password.

5.2.4 Enable manual identity linking in Supabase for guest registration.

5.2.5 After verifying the identity, save the player's chosen username through `PATCH /player`.

5.2.6 If the identity belongs to an existing account, offer sign-in under 5.3.

5.2.7 Retry incomplete registration on the same `player_id`.

## 5.3 Signing in and out

5.3.1 Restore the saved Supabase session when the app opens.

5.3.2 Successful sign-in loads that account's profile through `GET /player`.

5.3.3 Signing into an existing account never transfers guest progress into that account.

5.3.4 Before replacing a guest session, explain that its progress will not transfer and cannot be recovered through that sign-in.

5.3.5 Replace the active player's data only after sign-in succeeds.

5.3.6 Signing out ends the current session using Supabase's `local` scope, leaving other devices signed in.

## 5.4 Usernames

5.4.1 Usernames contain 3–20 ASCII letters, digits, or underscores.

5.4.2 Names differing only by capitalization count as the same username.

5.4.3 Display the capitalization chosen by the player.

5.4.4 The first chosen username sets `username_selected_at` without using the change allowance.

5.4.5 Allow two username changes within any rolling 30-day window.

5.4.6 Count `username_changes` timestamps later than `server_now - 30 days`.

5.4.7 Record a change only when a different displayed username is successfully saved after the initial selection.

5.4.8 When both changes are used, return `USERNAME_CHANGE_LIMIT` with the next allowed time in `error.details.next_change_at`.

## 5.5 Guest and registered access

5.5.1 Guests can view and practice their own archived games on the same device.

5.5.2 Registered players can retrieve their saved archive from another device after signing in.

5.5.3 Real-money purchases require a verified registered account before checkout creation.

## 5.6 Passwords

5.6.1 Passwords require at least eight characters, one digit, and one symbol.

5.6.2 Send passwords directly to Supabase Auth without saving them in app storage or the `users` table.

5.6.3 Signed-in password changes require the current password.

5.6.4 Forgotten-password recovery verifies a Supabase email reset link before accepting a new password.

5.6.5 Save a new password only when its confirmation field matches.

5.6.6 Password-reset requests show the same response whether the email address has an account or not.

5.6.7 Accounts using only Google recover their Google password through Google.

### Implementation references

- [Supabase guest accounts and registration](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Email/password sign-in and recovery](https://supabase.com/docs/guides/auth/passwords)
- [Current-password verification](https://supabase.com/docs/guides/auth/password-security)
- [Sign-out scope](https://supabase.com/docs/guides/auth/signout)
