import * as createError from "http-errors";
import Stripe from "stripe";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { StripeQueries } from "./stripe-queries.helper";

/**
 * Get the Stripe customer associated with a user.
 * @param appUser User
 * @param stripeClient Stripe API client
 * @returns Stripe customer associated with the user or null if not found
 * @throws HttpError
 */
export async function getStripeCustomerByUser$(
  appUser: AppUser,
  stripeClient: Stripe
): Promise<Stripe.Customer | null> {
  const query = StripeQueries.customer_byFusionAuthUserId(appUser.id);
  const { data: searchResults } = await stripeClient.customers.search({
    query,
  });

  if (searchResults.length === 0) {
    return null;
  }

  if (searchResults.length > 1) {
    throw createError.InternalServerError(
      `Multiple Stripe Customers found with user ID ${appUser.id}.`
    );
  }

  return searchResults[0];
}
