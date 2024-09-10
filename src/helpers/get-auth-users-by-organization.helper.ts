import FusionAuthClient, { Sort, User } from "@fusionauth/typescript-client";
import * as createError from "http-errors";

/**
 * Retrieve users in an organization.
 * @param organizationId Organization for which to retrieve users
 * @param authClient FusionAuth client
 * @returns Array of users
 */
export async function getUsersByOrganization$(
  organizationId: string,
  authClient: FusionAuthClient
): Promise<User[]> {
  const searchResult = await authClient.searchUsersByQuery({
    search: {
      query: JSON.stringify({
        match: {
          "data.organizationId": {
            query: organizationId,
          },
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

  if (searchResult.response.total !== searchResult.response.users?.length) {
    throw createError.InternalServerError(
      "System error: The number of users in your organization has exceeded " +
        "the limit. Pagination must be implemented to proceed."
    );
  }

  return searchResult.response.users ?? [];
}
