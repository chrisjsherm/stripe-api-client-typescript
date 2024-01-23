# Stripe API Client (TypeScript)

Web server for interacting with the Stripe API. Written in TypeScript.

## Configuration

1. Copy `.env.example` as `.env` and fill in the values with your configuration.
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).

## Development

1. Open a terminal and run: `npm start`
2. Open another terminal and run: `stripe login`
3. After logging in, run: `stripe listen --forward-to localhost:4242/webhook`
4. Open another terminal and run: `stripe trigger --help` to see a list of
   Stripe events you can generate.
