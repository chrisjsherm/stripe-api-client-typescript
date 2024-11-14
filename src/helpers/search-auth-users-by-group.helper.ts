import FusionAuthClient, { Sort, User } from "@fusionauth/typescript-client";
import * as createError from "http-errors";

/**
 * Retrieve users by group affiliation and search term.
 * @param authClient FusionAuth client
 * @param organizationId Organization for which to retrieve users
 * @param groupId ID of the group
 * @param searchTerm Term to fuzzy compare to firstName and lastName fields
 * @returns Array of users
 */
export async function searchAuthUsersByGroup$(
  authClient: FusionAuthClient,
  organizationId: string,
  groupId: string,
  searchTerm: string
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
            {
              fuzzy: {
                fullName: {
                  value: searchTerm,
                  fuzziness: "AUTO",
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
