import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Parameterized queries of the Stripe search API.
 */
export const StripeQueries = {
  getStripeCustomerByFusionAuthUserId: getStripeCustomerByFusionAuthId,
};

/**
 * Generate the Stripe query for getting a customer by FusionAuth user ID.
 * @param fusionAuthUserId FusionAuth user ID
 * @returns Query
 */
function getStripeCustomerByFusionAuthId(fusionAuthUserId: string): string {
  return `metadata['${ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId}']:'${fusionAuthUserId}'`;
}
