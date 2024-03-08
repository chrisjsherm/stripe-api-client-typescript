import FusionAuthClient, {
  GroupMember,
  User,
} from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { IBasicUser } from "../data-models/basic-user.interface";
import { getGroupMemberships$ } from "./get-group-memberships.helper";
import { getStripeCustomerByFusionAuthUser$ } from "./get-stripe-customer-by-fusion-auth-user.helper";

/**
 * Refresh the user's group memberships.
 * @param fusionAuthUser FusionAuth user
 * @param stripeClient Stripe API client
 * @param authClient FusionAuth API client
 * @returns FusionAuth user with refreshed memberships
 * @throws Error
 */
export async function refreshGroupMembership$(
  fusionAuthUser: IBasicUser,
  stripeClient: Stripe,
  authClient: FusionAuthClient
): Promise<User> {
  const stripeCustomer = await getStripeCustomerByFusionAuthUser$(
    fusionAuthUser,
    stripeClient
  );
  if (!stripeCustomer) {
    throw createError.NotFound(
      `Could not find Stripe customer associated with user ${fusionAuthUser.id}.`
    );
  }

  const groupMembershipsAccordingToCharges = await getGroupMemberships$(
    stripeCustomer.id,
    stripeClient
  );

  const getUserResult = await authClient.retrieveUser(fusionAuthUser.id);
  if (getUserResult.exception) {
    throw getUserResult.exception;
  }

  if (getUserResult.response.user === undefined) {
    throw createError.NotFound(`Could not find user ${fusionAuthUser.id}.`);
  }

  const currentMemberships = getUserResult.response.user?.memberships ?? [];
  if (
    currentMemberships.length === groupMembershipsAccordingToCharges.size &&
    currentMemberships.every((groupMembership: GroupMember): boolean => {
      if (groupMembership.groupId === undefined) {
        return false;
      }

      return groupMembershipsAccordingToCharges.has(groupMembership.groupId);
    })
  ) {
    // Memberships are up to date.
    return getUserResult.response.user;
  }

  const updatedMemberships: GroupMember[] = [];
  groupMembershipsAccordingToCharges.forEach((groupId: string): void => {
    updatedMemberships.push({
      groupId,
      userId: fusionAuthUser.id,
    });
  });

  const updateMembershipsResult = await authClient.updateUser(
    fusionAuthUser.id,
    {
      user: {
        ...getUserResult.response.user,
        memberships: updatedMemberships,
      },
    }
  );

  if (updateMembershipsResult.exception) {
    throw updateMembershipsResult.exception;
  }

  if (updateMembershipsResult.response.user === undefined) {
    throw createError.NotFound(
      `Could not find user ${fusionAuthUser.id} to update group memberships.`
    );
  }

  return updateMembershipsResult.response.user;
}
