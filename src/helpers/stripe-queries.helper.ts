import { DateTime } from "luxon";

/**
 * Parameterized queries of the Stripe search API.
 */
export const StripeQueries = {
  charge_successfulByCustomer: getChargesByCustomer,
};

/**
 * Generate Stripe query for successful charges by a customer.
 * @param stripeCustomerId Stripe customer ID
 * @param since Time from which to query
 * @returns Query
 */
function getChargesByCustomer(
  stripeCustomerId: string,
  since: DateTime
): string {
  return (
    `created>=${Math.floor(since.toSeconds())} AND ` +
    `status:'succeeded' AND ` +
    `customer:'${stripeCustomerId}' AND ` +
    `refunded:null`
  );
}
