# Stripe API Client (TypeScript)

Web server for interacting with the Stripe API. Written in TypeScript.

## Configuration

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Copy `.env.example` as `.env` and fill in the values with your configuration.

### FusionAuth

Create an API key for the `.env` file with access to the following:

- /api/group/member ALL
- /api/user GET
- /api/user/verify-email PUT

Create a Group for the `.env` file named "Subscription: Basic".

Configure a Webhook pointing to this server at the path `/webhooks/fusion-auth`
with `user.email.verified` enabled.

- Configure your tenant to have its `user.email.verified` webhook enabled and
  set the transaction so that all webhooks must succeed.

### Stripe

PaymentIntent objects should have a metadata entry with a key of `customer_id`
with the value matching the `id` property of the FusionAuth user for which the
PaymentIntent was created.

## Development

1. Open a terminal and run: `npm start`
2. Open another terminal and run: `stripe login`
3. After logging in, run: `stripe listen --forward-to localhost:4242/webhooks/stripe`
4. Verify the webhook signing secret in `.env` matches the one displayed in the terminal.
5. Open another terminal and run: `stripe trigger --help` to see a list of
   Stripe events you can generate.
