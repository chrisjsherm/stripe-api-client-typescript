import FusionAuthClient from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { getAuthUserById$ } from "./get-auth-user-by-id.helper";

/**
 * Create a Stripe customer from a FusionAuth user.
 * @param fusionAuthUserId FusionAuth user ID
 * @param authClient FusionAuth client
 * @param stripeClient Stripe client
 * @returns Stripe Customer
 * @throws Error
 */
export async function createStripeCustomer$(
  fusionAuthUserId: string,
  authClient: FusionAuthClient,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  const fusionAuthUser = await getAuthUserById$(fusionAuthUserId, authClient);

  if (!fusionAuthUser.verified) {
    throw createError.BadRequest(
      `FusionAuth user ${fusionAuthUser} is not verified. Verify before ` +
        "creating an associated Stripe customer."
    );
  }

  console.info(
    `Attempting to create Stipe Customer associated with FusionAuth user ${fusionAuthUserId}.`
  );
  const stripeCustomer = await stripeClient.customers.create({
    email: fusionAuthUser.email,
    name: fusionAuthUser.fullName,
    phone: fusionAuthUser.mobilePhone,
    metadata: {
      [ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId]:
        fusionAuthUserId,
    },
  });
  console.info(`Created Stripe Customer with id ${stripeCustomer.id}.`);
  return stripeCustomer;
}
