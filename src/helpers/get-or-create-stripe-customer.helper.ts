import FusionAuthClient from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { createStripeCustomer$ } from "./create-stripe-customer.helper";
import { synchronizeCustomerEmail } from "./synchronize-customer-email.helper";

/**
 * Get existing Stripe customer by FusionAuth user ID, or create if none exists.
 * @param fusionAuthUserId ID of the user in the FusionAuth tenant
 * @param fusionAuthUserEmail User's email
 * @param stripeClient Stripe API client
 * @param authClient FusionAuth API client
 * @returns Stripe customer
 * @throws Error
 */
export async function getOrCreateStripeCustomer$(
  fusionAuthUserId: string,
  fusionAuthUserEmail: string,
  stripeClient: Stripe,
  authClient: FusionAuthClient
): Promise<Stripe.Customer> {
  const query = `metadata['${ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId}']:'${fusionAuthUserId}'`;
  const { data: searchResults } = await stripeClient.customers.search({
    query,
  });

  if (searchResults.length > 1) {
    throw createError.FailedDependency(
      `Multiple Stripe Customers found with FusionAuth user ID ${fusionAuthUserId}.`
    );
  }

  if (searchResults.length === 1) {
    let stripeCustomer = searchResults[0];
    return synchronizeCustomerEmail(
      {
        id: fusionAuthUserId,
        email: fusionAuthUserEmail,
      },
      stripeCustomer,
      stripeClient
    );
  }

  console.info(
    "Did not find Stripe customer associated with FusionAuth user ID " +
      `${fusionAuthUserId}. Attempting to create a Stripe Customer.`
  );
  return await createStripeCustomer$(
    fusionAuthUserId,
    authClient,
    stripeClient
  );
}
