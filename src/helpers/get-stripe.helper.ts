import Stripe from "stripe";

let stripe: Stripe;
const envVarKey_StripeSecretKey = "STRIPE_SECRET_KEY";

/**
 * Get the Stripe SDK object as a singleton.
 * @returns Stripe SDK object.
 */
function getStripe() {
  const stripeKey = process.env[envVarKey_StripeSecretKey];

  if (!stripeKey) {
    throw new Error(
      `Environment variable ${envVarKey_StripeSecretKey} is not set.`
    );
  }

  if (!stripe) {
    stripe = new Stripe(stripeKey, {
      typescript: true,
    });
  }

  return stripe;
}

export default getStripe;
