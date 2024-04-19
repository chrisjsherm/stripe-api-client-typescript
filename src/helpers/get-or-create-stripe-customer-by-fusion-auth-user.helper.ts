import Stripe from "stripe";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { createStripeCustomer$ } from "./create-stripe-customer.helper";
import { getStripeCustomerByUser$ } from "./get-stripe-customer-by-fusion-auth-user.helper";

/**
 * Get existing Stripe customer by user ID, or create if none exists.
 * @param user User
 * @param stripeClient Stripe API client
 * @returns Stripe customer
 * @throws Error
 */
export async function getOrCreateStripeCustomerByUser$(
  user: AppUser,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  const stripeCustomer = await getStripeCustomerByUser$(user, stripeClient);
  if (stripeCustomer) {
    return stripeCustomer;
  }

  console.info(
    `Did not find Stripe customer associated with user ID ${user.id}. ` +
      "Attempting to create a Stripe Customer."
  );
  return await createStripeCustomer$(user, stripeClient);
}
