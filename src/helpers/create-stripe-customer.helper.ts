import Stripe from "stripe";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Create a Stripe customer from a user.
 * @param appUser User
 * @param stripeClient Stripe client
 * @returns Stripe Customer
 * @throws Error
 */
export async function createStripeCustomer$(
  appUser: AppUser,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  console.info(
    `Attempting to create Stipe Customer associated with user ${appUser.id}.`
  );
  const stripeCustomer = await stripeClient.customers.create({
    email: appUser.email,
    name: `${appUser.firstName} ${appUser.lastName}`,
    phone: appUser.mobilePhone,
    metadata: {
      [ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId]:
        appUser.id,
    },
  });
  console.info(`Created Stripe Customer with id ${stripeCustomer.id}.`);
  return stripeCustomer;
}
