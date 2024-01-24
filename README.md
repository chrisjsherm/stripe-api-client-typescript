# Stripe API Client (TypeScript)

Web server for interacting with the Stripe API. Written in TypeScript.

## Configuration

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Copy `.env.example` as `.env` and fill in the values with your configuration.
3. Adjust the values in
   `src/environment/development.configuration.ts` and
   `src/environment/production.configuration.ts`.

## Development

1. Open a terminal and run: `npm start`
2. Open another terminal and run: `stripe login`
3. After logging in, run: `stripe listen --forward-to localhost:4242/webhook`
4. Verify the webhook signing secret in `.env` matches the one displayed in the terminal.
5. Open another terminal and run: `stripe trigger --help` to see a list of
   Stripe events you can generate.
