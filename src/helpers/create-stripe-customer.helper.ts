import FusionAuthClient from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Create a Stripe customer from a FusionAuth user.
 * @param fusionAuthUser FusionAuth user
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
  console.info(`Querying FusionAuth for user with ID ${fusionAuthUserId}.`);
  const getUserResponse = await authClient.retrieveUser(fusionAuthUserId);
  console.info(`Retrieved user with id ${fusionAuthUserId} from FusionAuth.`);

  if (getUserResponse.exception) {
    console.info(
      `Encountered an exception querying FusionAuth for user with ID ${fusionAuthUserId}.`
    );
    throw createError.BadGateway(getUserResponse.exception.message);
  }

  const fusionAuthUser = getUserResponse.response.user;
  if (fusionAuthUser === undefined) {
    throw createError.NotFound(
      `FusionAuth user with ID ${fusionAuthUserId} not found.`
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
