import FusionAuthClient from "@fusionauth/typescript-client";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Associate a a FusionAuth user with a Stripe customer.
 * @param userId FusionAuth user ID
 * @param customerId Stripe customer ID
 * @param authClient FusionAuth client
 * @returns Updated FusionAuth user
 * @throws Error
 */
export async function associateUserWithCustomer$(
  userId: string,
  customerId: string,
  authClient: FusionAuthClient
) {
  const result = await authClient.patchUser(userId, {
    user: {
      data: {
        [ConstantConfiguration.fusionAuth_user_data_stripeCustomerId]:
          customerId,
      },
    },
  });

  if (!result.wasSuccessful()) {
    throw result.exception;
  }

  return result.response.user;
}
