import FusionAuthClient, {
  GroupMember,
  User,
} from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { DecodedAccessToken } from "../data-models/interfaces/decoded-access-token.interface";
import { getAuthUserById$ } from "./get-auth-user-by-id.helper";
import { getGroupMemberships$ } from "./get-group-memberships.helper";
import { getStripeCustomerById$ } from "./get-stripe-customer-by-id.helper";

/**
 * Refresh the user's group memberships.
 * @param fusionAuthUser FusionAuth user
 * @param stripeClient Stripe API client
 * @param authClient FusionAuth API client
 * @returns FusionAuth user with refreshed memberships
 * @throws Error
 */
export async function refreshGroupMembership$(
  fusionAuthUser: DecodedAccessToken,
  stripeClient: Stripe,
  authClient: FusionAuthClient
): Promise<User> {
  if (!fusionAuthUser.emailVerified) {
    console.info(
      "Your account must be verified to refresh group memberships. " +
        "Skipping refresh."
    );
    return fusionAuthUser;
  }

  if (!fusionAuthUser.stripeCustomerId) {
    console.info(
      "Your account does not have a customer account associated with it. " +
        "Skipping refresh."
    );
    return fusionAuthUser;
  }

  const stripeCustomer = await getStripeCustomerById$(
    fusionAuthUser.stripeCustomerId,
    stripeClient
  );
  if (!stripeCustomer) {
    throw createError.NotFound(
      "We did not find a Stripe customer associated with user: " +
        fusionAuthUser.userId
    );
  }

  const groupMemberships = await getGroupMemberships$(
    stripeCustomer.id,
    stripeClient
  );

  const user = await getAuthUserById$(fusionAuthUser.userId, authClient);
  const currentMemberships = user.memberships ?? [];

  if (
    currentMemberships.length === groupMemberships.size &&
    currentMemberships.every((groupMembership: GroupMember): boolean => {
      if (groupMembership.groupId === undefined) {
        return false;
      }

      return groupMemberships.has(groupMembership.groupId);
    })
  ) {
    // Memberships are up to date.
    return user;
  }

  for (const membership of currentMemberships) {
    if (membership.groupId === undefined) {
      continue;
    }

    if (groupMemberships.has(membership.groupId)) {
      // User already has this membership. Remove from the list of memberships
      // we will add.
      groupMemberships.delete(membership.groupId);
      continue;
    }

    // Membership is no longer active according to recent Charges.
    console.info(
      `Removing user ${fusionAuthUser.userId} from group ${membership.groupId}.`
    );
    await authClient.deleteGroupMembers({
      members: {
        [membership.groupId]: [fusionAuthUser.userId],
      },
    });
  }

  // Add missing memberships.
  for (const groupId of groupMemberships) {
    console.info(`Adding user ${fusionAuthUser.userId} to group ${groupId}.`);
    await authClient.createGroupMembers({
      members: {
        [groupId]: [{ userId: fusionAuthUser.userId }],
      },
    });
  }

  return await getAuthUserById$(fusionAuthUser.userId, authClient);
}
