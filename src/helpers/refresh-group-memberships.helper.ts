import FusionAuthClient, {
  GroupMember,
  User,
} from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import Stripe from "stripe";
import { IBasicUser } from "../data-models/basic-user.interface";
import { getAuthUserById$ } from "./get-auth-user-by-id.helper";
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

  const groupMemberships = await getGroupMemberships$(
    stripeCustomer.id,
    stripeClient
  );

  const user = await getAuthUserById$(fusionAuthUser.id, authClient);
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
      `Removing user ${fusionAuthUser.id} from group ${membership.groupId}.`
    );
    await authClient.deleteGroupMembers({
      members: {
        [membership.groupId]: [fusionAuthUser.id],
      },
    });
  }

  // Add missing memberships.
  for (const groupId of groupMemberships) {
    console.info(`Adding user ${fusionAuthUser.id} to group ${groupId}.`);
    await authClient.createGroupMembers({
      members: {
        [groupId]: [{ userId: fusionAuthUser.id }],
      },
    });
  }

  return await getAuthUserById$(fusionAuthUser.id, authClient);
}
