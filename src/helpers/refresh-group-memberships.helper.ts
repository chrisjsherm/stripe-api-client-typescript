import FusionAuthClient, { User } from "@fusionauth/typescript-client";
import { DecodedAccessToken } from "../data-models/interfaces/decoded-access-token.interface";
import { getAuthUserById$ } from "./get-auth-user-by-id.helper";
import { getDefaultMembershipsByOrganization$ } from "./get-group-memberships.helper";

/**
 * Apply default FusionAuth group memberships to the user.
 * @param accessToken FusionAuth user
 * @param authClient FusionAuth API client
 * @returns FusionAuth user with refreshed memberships
 * @throws Error
 */
export async function applyDefaultMemberships$(
  accessToken: DecodedAccessToken,
  authClient: FusionAuthClient
): Promise<User> {
  if (!accessToken.emailVerified) {
    console.info(
      "Your account must be verified to refresh group memberships. " +
        "Skipping refresh."
    );
    return accessToken;
  }

  if (!accessToken.organizationId) {
    console.info("Your account is not associated with an organization.");
    return accessToken;
  }

  const groupMemberships = await getDefaultMembershipsByOrganization$(
    accessToken.organizationId
  );

  const user = await getAuthUserById$(accessToken.id, authClient);
  const currentMemberships = user.memberships ?? [];

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
  }

  // Add missing memberships.
  for (const groupId of groupMemberships) {
    console.info(`Adding user ${accessToken.id} to group ${groupId}.`);
    await authClient.createGroupMembers({
      members: {
        [groupId]: [{ userId: accessToken.id }],
      },
    });
  }

  return await getAuthUserById$(accessToken.id, authClient);
}
