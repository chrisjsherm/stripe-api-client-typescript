import { DateTime } from "luxon";
import { Stripe } from "stripe";
import { StripeQueries } from "./stripe-queries.helper";

/**
 * Get successful Stripe charges made by the customer.
 * @param stripeCustomerId Stripe customer ID
 * @param since Time from which to query
 * @param stripeClient Stripe API client
 * @param expandFields Charge fields to expand (https://docs.stripe.com/expand)
 * @returns Stripe charges
 */
export async function getSuccessfulCharges$(
  stripeCustomerId: string,
  since: DateTime,
  stripeClient: Stripe,
  expandFields = new Array<string>()
): Promise<Stripe.Charge[]> {
  const query = StripeQueries.charge_successfulByCustomer(
    stripeCustomerId,
    since
  );

  const { data: searchResults } = await stripeClient.charges.search({
    query,
    expand: expandFields,
  });
  return searchResults;
}
