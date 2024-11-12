import FusionAuthClient, { Sort, User } from "@fusionauth/typescript-client";
import * as createError from "http-errors";

/**
 * Retrieve users in an organization by group affiliation.
 * @param groupId Auth group user must be associated with
 * @param organizationId Organization for which to retrieve users
 * @param authClient FusionAuth client
 * @returns Array of users
 */
export async function getUsersByGroup$(
  groupId: string,
  organizationId: string,
  authClient: FusionAuthClient
): Promise<User[]> {
  const searchResult = await authClient.searchUsersByQuery({
    search: {
      query: JSON.stringify({
        bool: {
          must: [
            {
              match: {
                "data.organizationId": {
                  query: organizationId,
                },
              },
            },
            {
              match: {
                "memberships.groupId": {
                  query: groupId,
                },
              },
            },
          ],
        },
      }),
      accurateTotal: true,
      sortFields: [
        {
          name: "fullName",
          order: Sort.asc,
        },
        {
          name: "email",
          order: Sort.asc,
        },
        {
          name: "insertInstant",
          order: Sort.asc,
        },
      ],
    },
  });

  if (searchResult.exception) {
    throw createError.InternalServerError(searchResult.exception.message);
  }

  return searchResult.response.users ?? [];
}
