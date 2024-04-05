import * as createError from "http-errors";
import Stripe from "stripe";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Create a Stripe customer from a FusionAuth user.
 * @param fusionAuthUser FusionAuth user
 * @param stripeClient Stripe client
 * @returns Stripe Customer
 * @throws Error
 */
export async function createStripeCustomer$(
  fusionAuthUser: AppUser,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  if (!fusionAuthUser.emailVerified) {
    throw createError.BadRequest(
      `FusionAuth user ${fusionAuthUser} is not verified. Verify before ` +
        "creating an associated Stripe customer."
    );
  }

  console.info(
    `Attempting to create Stipe Customer associated with FusionAuth user ${fusionAuthUser.id}.`
  );
  const stripeCustomer = await stripeClient.customers.create({
    email: fusionAuthUser.email,
    name: `${fusionAuthUser.firstName} ${fusionAuthUser.lastName}`,
    phone: fusionAuthUser.mobilePhone,
    metadata: {
      [ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId]:
        fusionAuthUser.id,
    },
  });
  console.info(`Created Stripe Customer with id ${stripeCustomer.id}.`);
  return stripeCustomer;
}
