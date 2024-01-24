import Stripe from "stripe";
import { IBuildConfiguration } from "../environment/data-models/build-configuration.interface";

let stripe: Stripe;

/**
 * Get the Stripe SDK object as a singleton.
 * @returns Stripe SDK object.
 */
function getStripe(environment: IBuildConfiguration) {
  const stripeKey = environment.payments.secretKey;

  if (!stripeKey) {
    throw new Error(`Environment variable for payments secret key is not set.`);
  }

  if (!stripe) {
    stripe = new Stripe(stripeKey, {
      typescript: true,
    });
  }

  return stripe;
}

export default getStripe;
