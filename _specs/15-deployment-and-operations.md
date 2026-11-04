# 15. Deployment and operations

## 15.1 Hosting and environments

15.1.1 Host the built web app on Cloudflare Pages and the backend on Supabase.

15.1.2 Use these environments.

| Environment | Web | Backend | Billing |
| --- | --- | --- | --- |
| Local | Vite development server | Local Supabase | Stripe test mode |
| Staging | Separate Pages project | Separate Supabase project | Stripe test mode |
| Production | App domain on Pages | Production Supabase project | Stripe live mode |

15.1.3 Use separate credentials and databases for staging and production.

15.1.4 Keep production player data out of local and staging fixtures.

## 15.2 Configuration

15.2.1 Keep public browser configuration separate from server and deployment secrets.

| Location | Configuration |
| --- | --- |
| Browser build | App origin, Supabase URL, publishable key, asset origin, and enabled provider IDs |
| Server secrets | Supabase server credentials, Stripe secret key, webhook secret, and allowed app origins |
| Deployment secrets | Supabase deployment credentials and Cloudflare deployment credentials |
| Provider dashboards | Google redirects, email redirects, Stripe return URLs, webhook URL, prices, and portal settings |
| Content files | Rule settings, enabled products, audio mappings, and sprite bindings from Sections 2–12 |

15.2.2 Commit `.env.example` with variable names and empty secret values.

15.2.3 Pin dependency versions and commit the npm lockfile.

15.2.4 Restrict browser origins and authentication redirects to configured app destinations.

15.2.5 Serve the app and provider callbacks through HTTPS.

15.2.6 Route direct app paths, including `/challenge/{game_id}`, to the PWA entry document.

15.2.7 Keep Supabase privileged keys and Stripe secrets out of browser bundles.

## 15.3 Build and release

15.3.1 Run dependency installation, type checks, tests, contract generation, asset validation, and the web build in GitHub Actions.

15.3.2 Build the production web artifact from `apps/web` under 2.4.

15.3.3 Apply database changes only through committed migrations in `supabase/migrations/`.

15.3.4 Deploy in this order.

```text
procedure release(commit):
    run checks under Section 14
    deploy migrations and functions to staging
    deploy the web artifact and content to staging
    complete staging acceptance under 14.7.3
    verify a current production backup under 15.5
    apply backward-compatible production migrations
    deploy production functions and immutable content assets
    deploy the production web artifact
    verify Home, sign-in redirects, and direct challenge-link loading
    verify the Stripe webhook endpoint configuration
    record deployment IDs, migration IDs, and commit
```

15.3.5 Keep backend contracts compatible with cached clients that still have pending uploads.

15.3.6 Use content-hashed asset filenames and retain assets referenced by active or queued games.

15.3.7 Allow app-shell revalidation while caching immutable assets by their full URL.

15.3.8 Apply service-worker activation and local-data migration rules from Section 13.

15.3.9 Enable money products only after verifying live prices, webhook delivery, and fulfillment in the production configuration.

## 15.4 Rollback

15.4.1 Keep the previous web deployment and compatible server artifact available for rollback.

15.4.2 Roll back the web deployment for a client regression without clearing browser storage.

15.4.3 Repair database migrations with a forward migration instead of reversing writes containing player data.

15.4.4 Disable affected products or endpoints while repairing duplicate grants or incorrect balances.

15.4.5 Reprocess failed billing events through the idempotent handler in 4.7.9.

## 15.5 Backups and recovery

15.5.1 Back up the production database nightly, retaining seven daily and four weekly backups.

15.5.2 Use provider backups or scheduled encrypted exports according to the configured Supabase plan.

15.5.3 Keep rule files, catalogs, migrations, and source asset references in version control.

15.5.4 Test a database restore into an isolated project before launch.

15.5.5 Record the backup timestamp and unconfirmed operations affected by any production restore.

15.5.6 Reconcile Stripe orders and paid cycles after a restore before reopening purchases.

## 15.6 Monitoring and support

15.6.1 Log server operation IDs, player IDs, durations, error codes, and billing event IDs.

15.6.2 Exclude passwords, access tokens, payment secrets, and card data from logs.

15.6.3 Alert the operator on failed billing fulfillment, repeated server failures, and failed scheduled backups.

15.6.4 Provide operator commands to inspect an order, retry an event, recover token permits, and change purchase restrictions.

15.6.5 Record operator actions with the account, reason, timestamp, and operation receipt.

15.6.6 Display a support contact for payment issues and rejected uploads.

Implementation references: [Supabase environments](https://supabase.com/docs/guides/deployment/managing-environments), [Supabase backups](https://supabase.com/docs/guides/platform/backups), [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/), [Stripe webhooks](https://docs.stripe.com/webhooks).
