import * as createError from "http-errors";
import Stripe from "stripe";
import { IBasicUser } from "../data-models/interfaces/basic-user.interface";
import { StripeQueries } from "./stripe-queries.helper";
import { synchronizeCustomerEmail } from "./synchronize-customer-email.helper";

/**
 * Get the Stripe customer associated with a FusionAuth user.
 * @param fusionAuthUser FusionAuth user
 * @param stripeClient Stripe API client
 * @returns Stripe customer associated with the FusionAuth user or null if not
 * found
 * @throws HttpError
 */
export async function getStripeCustomerByFusionAuthUser$(
  fusionAuthUser: IBasicUser,
  stripeClient: Stripe
): Promise<Stripe.Customer | null> {
  const query = StripeQueries.customer_byFusionAuthUserId(fusionAuthUser.id);
  const { data: searchResults } = await stripeClient.customers.search({
    query,
  });

  if (searchResults.length === 0) {
    return null;
  }

  if (searchResults.length > 1) {
    throw createError.FailedDependency(
      `Multiple Stripe Customers found with FusionAuth user ID ${fusionAuthUser.id}.`
    );
  }

  // Take this opportunity to synchronize email, if necessary.
  const stripeCustomer = await synchronizeCustomerEmail(
    fusionAuthUser,
    searchResults[0],
    stripeClient
  );
  return stripeCustomer;
}
