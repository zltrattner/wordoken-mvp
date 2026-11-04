# 11. Store and payments

## 11.1 Product catalog

11.1.1 Define store products in `content/catalog/products.json`.

11.1.2 Use these catalog fields for product fulfillment.

| Catalog field | Contents |
| --- | --- |
| `id`, `name`, `image` | Stable product ID, display name, and image reference |
| `price` | Coin price for coin products; localized money display from 11.4 for money products |
| `requirements.available` | Whether the product can currently be purchased |
| `requirements.min_level` | Product acquisition level; avatar items read their value from 3.10 |
| `requirements.subscription_required` | Product acquisition restriction; avatar items read their value from 3.10 |
| `type` | `avatar_item`, `chest`, `game_pack`, `coin_pack`, or `subscription` |
| `grants` | Item IDs and quantities, coins, or game tokens granted by the purchase |
| `ownership_limit` | Maximum owned quantity for an item; null for stackable items |
| `chest_pool_id` | Chest definition in 11.3; null for other products |
| `subscription_plan_id` | Plan definition in 11.5; null for other products |
| `stripe_price_id` | Stripe Price ID for money products; null for coin-priced products |
| `base_price` | Server-configured amount and currency matching `stripe_price_id`; null for coin-priced products |
| `currency_prices` | Fixed local prices keyed by currency code, with amounts in minor units |

11.1.3 Fulfill each product type through the destination below.

| Product type | Payment | Destination |
| --- | --- | --- |
| Avatar item | Coins | Item from 3.10 in `users.inventory` |
| Chest | Coins | Unopened chest quantity in `users.inventory` |
| Game pack | Coins | Unallocated `users.game_tokens` |
| Coin pack | Money | `users.coins` |
| Subscription | Money | `users.subscription` and configured plan benefits |

11.1.4 Limit each avatar item's owned quantity to one.

11.1.5 Convert purchased game tokens into device permits through 4.3.4.

11.1.6 Keep product IDs stable across price and availability changes.

11.1.7 Both direct purchases and chest awards read avatar-item acquisition requirements from 3.10.

## 11.2 Coin purchases

11.2.1 Run store mutations through the device synchronization procedure in 13.2.3.

11.2.2 Fulfill `POST /store/purchases` through `apply_once` in 4.8.1 with this operation.

```text
function purchase_with_coins(request):
    product = catalog_product(request.input.product_id)
    require product exists else PRODUCT_NOT_FOUND
    require product.price.currency == coins else INVALID_REQUEST
    check purchase requirements under 4.7.4
    require request.input.expected_coin_price == product.price.amount
        else PRICE_CHANGED with the current price
    user.coins -= product.price.amount
    grants = copy(product.grants)
    apply item and token grants to user
    grants.coin_shortfall_repaid = credit_coins(user, grants.coins or 0)
    receipt = save_purchase_receipt(product.id, product.price, grants)
    return {receipt, grants, player_state = current_player_state()}
```

11.2.3 Buying an avatar item leaves the equipped avatar unchanged.

11.2.4 After `PRICE_CHANGED`, require confirmation of the new price before sending a new purchase request.

## 11.3 Chests

11.3.1 Define chest pools in `content/catalog/chests.json`.

| Pool field | Contents |
| --- | --- |
| `id` | Stable pool ID referenced by a chest product |
| `item_count` | One item for small chests; two for large chests, before duplicate conversion |
| `outcomes` | Coin and avatar-item reward bundles matching `item_count`, each containing `grants` and a positive integer `weight` |

11.3.2 Roll chest rewards on the server with this function.

```text
function roll_and_resolve_rewards(pool, user):
    require each outcome has positive coins, positive item quantities,
        a total item quantity equal to pool.item_count, and a positive integer weight
    level = level_for_xp(user.xp, shared_thresholds)
    eligible = outcomes in pool where every awarded item:
        has avatar_item(item.id).min_level <= level
        and (not avatar_item(item.id).subscription_required or user has an active subscription)
    require eligible is not empty else ITEM_LOCKED
    roll = server_random_integer(1, sum(outcome.weight for outcome in eligible))
    for outcome in eligible:
        roll -= outcome.weight
        if roll <= 0:
            selected = outcome
            break
    grants = {coins = selected.grants.coins, items = []}
    owned = item IDs with positive quantities in user.inventory
    for item in selected.grants.items:
        repeat item.quantity times:
            if item.id in owned:
                grants.coins += avatar_item(item.id).duplicate_coin_value
            else:
                append {id = item.id, quantity = 1} to grants.items
                add item.id to owned
    return grants
```

11.3.3 Fulfill `POST /store/chests/open` through `apply_once` in 4.8.1 with this operation.

```text
function open_chest(request):
    chest = chest_item(request.input.item_id)
    require chest exists else PRODUCT_NOT_FOUND
    require user.inventory[chest.item_id] >= 1 else ITEM_NOT_OWNED
    pool = configured_pool(chest.chest_pool_id)
    require pool has configured outcomes, item_count, and duplicate compensation amounts
        else PRODUCT_NOT_FOUND
    grants = roll_and_resolve_rewards(pool, user)
    user.inventory[chest.item_id] -= 1
    if user.inventory[chest.item_id] == 0:
        remove chest.item_id from user.inventory
    apply item and token grants to user
    grants.coin_shortfall_repaid = credit_coins(user, grants.coins or 0)
    receipt = save_chest_receipt(chest.item_id, pool.id, grants)
    return {receipt, grants, player_state = current_player_state()}
```

11.3.4 Show the awarded coins and items after storing the successful reply locally.

## 11.4 Money purchases

11.4.1 Create or recover hosted checkout through 4.7.6.

11.4.2 Save `order_id` under the active account before opening `checkout_url`.

11.4.3 On checkout return or app reopening, retrieve unresolved orders through `GET /store/orders/{order_id}`.

| Order status | App behavior |
| --- | --- |
| `pending` | Show payment confirmation as pending |
| `fulfilled` | Display the receipt and refresh confirmed player state through 13.2.3 |
| `failed` | Show the failed payment and allow a new checkout |
| `expired` | Show the expired checkout and allow a new checkout |

11.4.4 Grant purchases only through the verified provider callback in 4.7.9.

11.4.5 Keep unresolved orders for later lookup when checkout closes without a final status.

11.4.6 Use Stripe Checkout for coin packs and subscriptions.

11.4.7 Enable Stripe Adaptive Pricing for supported currencies without a fixed local price.

11.4.8 Show money prices using Stripe-provided localized amounts and currency codes.

11.4.9 Use Stripe Customer Portal for subscription management.

11.4.10 Configure fixed local prices through Stripe Price `currency_options`.

Implementation references: [Adaptive Pricing](https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing?payment-ui=stripe-hosted), [Customer Portal](https://docs.stripe.com/customer-management).

## 11.5 Subscriptions

11.5.1 Define subscription plans in `content/catalog/subscriptions.json`.

| Plan field | Contents |
| --- | --- |
| `id` | Stable plan ID referenced by the subscription product |
| `billing_interval` | Provider billing interval |
| `game_allowance` | Quantity in 11.6, granted and refilled under 11.5.4-11.5.5 |
| `paid_cycle_grants` | Benefits issued once per confirmed paid cycle |

11.5.2 Display the current plan and management action from the saved server subscription state.

11.5.3 Refresh subscription state through `GET /store/subscription` after returning from management.

11.5.4 Grant the allowance in 11.6 immediately when the subscription starts.

11.5.5 Refill unused subscription plays to that allowance once 24 hours have passed since the last grant.

11.5.6 Keep the daily free permit in 4.3 separate from subscription plays.

11.5.7 Cache the provider-confirmed `paid_through` timestamp on the device.

11.5.8 Allow offline subscription refills and subscription-funded starts only while device time is earlier than `paid_through`.

11.5.9 Extend `paid_through` only after confirming renewal online.

11.5.10 Cancellation stops renewal without shortening `paid_through`.

11.5.11 End subscription benefits at `paid_through` if renewal remains unpaid, without a grace period.

11.5.12 Previously acquired subscriber items remain owned and usable after subscription benefits end.

11.5.13 Require an active subscription to acquire additional subscriber items.

11.5.14 Apply the subscription allowance separately on each installation and accept extra games and rewards from overlapping offline use.

## 11.6 Initial settings

11.6.1 Use these initial prices and subscription allowance.

| Product or allowance | Initial setting |
| --- | --- |
| Coin pack | 500 coins; USD 1.99 base price; CAD 2.99 fixed local price |
| Subscription | USD 4.99 base price per month |
| Subscription allowance | 10 games per day |
| Small chest | 75 coins |
| Game pack | 100 coins for 5 game tokens |
| Green or blue bandana | 75 coins each |

11.6.2 Use these minimum purchase levels.

| Product | Minimum level |
| --- | --- |
| Large chest | 15 |
| Katana | 20 |
| Armor | 25 |

11.6.3 Use USD as the Stripe base currency.

Sources: [Store](../design-reference/store.txt), [Subscribe](../design-reference/subscribe.txt), [Active plan](../design-reference/activeplan.txt).

## 11.7 Content and integration inputs

11.7.1 Set `requirements.available = false` for products missing required prices, grants, or reward data.

| Decision | Required settings |
| --- | --- |
| Stripe integration | Localized in-app price retrieval and provider callback mapping |
| Product settings | Remaining prices and pack quantities |
| Chest rewards | Outcome bundles, weights, coin amounts, and duplicate compensation amounts |

## 11.8 Payment reversals and coin shortfalls

11.8.1 Use Stripe fraud screening and risk-based 3D Secure for money purchases.

11.8.2 Show a recognizable payment descriptor, purchase receipt, and support contact.

11.8.3 Apply coin reversals only for completed refunds or lost disputes.

11.8.4 Reconcile each payment's cumulative reversed coin grant with this procedure inside 4.7.9.

```text
procedure reconcile_coin_reversal(order, provider_state):
    require order has a fulfilled coin grant and a positive customer_payment.amount
    reversed_amount = net finalized amount returned to the customer,
        without counting the same refund and dispute loss twice
    use the original customer-payment currency for both amounts
    fraction = clamp(reversed_amount / order.customer_payment.amount, 0, 1)
    target = ceil(order.product.grants.coins * fraction)
    delta = target - order.reversed_coins
    if delta > 0:
        recovered = min(user.coins, delta)
        user.coins -= recovered
        user.coin_shortfall += delta - recovered
    else if delta < 0:
        credit_coins(user, -delta)
    order.reversed_coins = target
    save order.reversal_state and the adjustment receipt

procedure credit_coins(user, amount):
    require amount is a nonnegative integer
    recovered = min(user.coin_shortfall, amount)
    user.coin_shortfall -= recovered
    user.coins += amount - recovered
    return recovered
```

11.8.5 Route all coin credits through `credit_coins`, including gameplay, chests, purchases, and reversal corrections.

11.8.6 Keep acquired items, purchased game tokens, XP, and completed games after a coin reversal.

11.8.7 Show gross coin awards, coins applied to the shortfall, and the remaining spendable balance.

11.8.8 A coin shortfall creates no cash payment obligation.

11.8.9 Remove entitlement for a fully reversed subscription cycle when the device next synchronizes.

11.8.10 Preserve other paid cycles and completed games when removing that entitlement.

11.8.11 Partial subscription refunds leave that cycle's entitlement unchanged.

11.8.12 An operator may set `purchases_restricted` after reviewing repeated payment abuse.

11.8.13 Restricted accounts cannot start coin or money purchases until an operator clears the restriction.

11.8.14 Pending disputes alone leave earned progress and purchased grants unchanged.

Provider references: [Fraud prevention](https://docs.stripe.com/disputes/prevention/best-practices), [Refunds](https://docs.stripe.com/refunds).
