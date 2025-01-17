import FusionAuthClient, { User } from "@fusionauth/typescript-client";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";

/**
 * Get auth user by ID.
 * @param id FusionAuth user ID
 * @param organizationId Organization the user is associated with
 * @param authClient FusionAuth client
 * @returns User
 * @throws Error
 */
export async function getAuthUserById$(
  id: string,
  organizationId: string,
  authClient: FusionAuthClient
): Promise<User> {
  try {
    const getUserResult = await authClient.retrieveUser(id);
    if (
      getUserResult.response.user === undefined ||
      getUserResult.response.user.data?.organizationId !== organizationId
    ) {
      throw createError.NotFound(`Could not find user ${id}.`);
    }

    return getUserResult.response.user;
  } catch (err: any) {
    if (err?.statusCode === StatusCodes.NOT_FOUND) {
      throw createError.NotFound(`Could not find user ${id}.`);
    }

    throw err;
  }
}
