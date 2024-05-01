import Stripe from "stripe";
import { DecodedAccessToken } from "../data-models/interfaces/decoded-access-token.interface";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Create a Stripe customer from a user.
 * @param appUser User
 * @param stripeClient Stripe client
 * @returns Stripe Customer
 * @throws Error
 */
export async function createStripeCustomer$(
  appUser: DecodedAccessToken,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  console.info("Sending create customer request to Stripe.");
  const stripeCustomer = await stripeClient.customers.create({
    email: appUser.email,
    name: `${appUser.firstName} ${appUser.lastName}`,
    phone: appUser.mobilePhone,
    metadata: {
      [ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId]:
        appUser.userId,
    },
  });
  console.info(`Created Stripe customer with ID: ${stripeCustomer.id}`);
  return stripeCustomer;
}
