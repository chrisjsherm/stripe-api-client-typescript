import FusionAuthClient from "@fusionauth/typescript-client";
import Stripe from "stripe";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { createStripeCustomer$ } from "./create-stripe-customer.helper";
import { getStripeCustomerByFusionAuthUser$ } from "./get-stripe-customer-by-fusion-auth-user.helper";

/**
 * Get existing Stripe customer by FusionAuth user ID, or create if none exists.
 * @param fusionAuthUser FusionAuth user
 * @param stripeClient Stripe API client
 * @param authClient FusionAuth API client
 * @returns Stripe customer
 * @throws Error
 */
export async function getOrCreateStripeCustomerByFusionAuthUser$(
  fusionAuthUser: AppUser,
  stripeClient: Stripe,
  authClient: FusionAuthClient
): Promise<Stripe.Customer> {
  const stripeCustomer = await getStripeCustomerByFusionAuthUser$(
    fusionAuthUser,
    stripeClient
  );
  if (stripeCustomer) {
    return stripeCustomer;
  }

  console.info(
    "Did not find Stripe customer associated with FusionAuth user ID " +
      `${fusionAuthUser.id}. Attempting to create a Stripe Customer.`
  );
  return await createStripeCustomer$(
    fusionAuthUser.id,
    authClient,
    stripeClient
  );
}
