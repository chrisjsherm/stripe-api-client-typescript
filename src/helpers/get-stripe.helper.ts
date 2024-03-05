import Stripe from "stripe";
import { IBuildConfiguration } from "../environment/data-models/build-configuration.interface";

let stripe: Stripe;

/**
 * Get the Stripe SDK object as a singleton.
 * @param environment Build environment metadata.
 * @returns Stripe SDK object.
 * @throws Error if environment variable for payments secret is not set
 */
function getStripe(environment: IBuildConfiguration): Stripe {
  const stripeKey = environment.payments.apiKey;

  if (!stripe) {
    stripe = new Stripe(stripeKey, {
      typescript: true,
    });
  }

  return stripe;
}

export default getStripe;
