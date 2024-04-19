import FusionAuthClient, {
  User as FusionAuthUser,
} from "@fusionauth/typescript-client";
import Stripe from "stripe";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Handle the Stripe "customer.created" event.
 * @param customer Stripe customer
 * @param authClient FusionAuth client
 * @returns Updated FusionAuth user
 * @throws Error
 */
export async function onCustomerCreatedEvent$(
  customer: Stripe.Customer,
  authClient: FusionAuthClient
): Promise<FusionAuthUser | undefined> {
  const userId =
    customer.metadata[
      ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId
    ];

  const result = await authClient.patchUser(userId, {
    user: {
      data: {
        [ConstantConfiguration.fusionAuth_user_data_stripeCustomerId]:
          customer.id,
      },
    },
  });

  if (!result.wasSuccessful()) {
    throw result.exception;
  }

  return result.response.user;
}
