import { DateTime } from "luxon";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Parameterized queries of the Stripe search API.
 */
export const StripeQueries = {
  charge_successfulByCustomer: getChargesByCustomer,
  customer_byFusionAuthUserId: getStripeCustomerByFusionAuthId,
};

/**
 * Generate the Stripe query for getting a customer by FusionAuth user ID.
 * @param fusionAuthUserId FusionAuth user ID
 * @returns Query
 */
function getStripeCustomerByFusionAuthId(fusionAuthUserId: string): string {
  return `metadata['${ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId}']:'${fusionAuthUserId}'`;
}

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
    `created>=${since.toMillis()} AND ` +
    `status:'succeeded' AND ` +
    `refunded:'false' AND ` +
    `customer:'${stripeCustomerId}'`
  );
}
