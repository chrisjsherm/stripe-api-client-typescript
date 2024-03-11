import FusionAuthClient, { User } from "@fusionauth/typescript-client";
import * as createError from "http-errors";

/**
 * Get auth user by ID.
 * @param id FusionAuth user ID
 * @param authClient FusionAuth client
 * @returns User
 * @throws Error
 */
export async function getAuthUserById$(
  id: string,
  authClient: FusionAuthClient
): Promise<User> {
  const getUserResult = await authClient.retrieveUser(id);
  if (getUserResult.exception) {
    throw getUserResult.exception;
  }

  if (getUserResult.response.user === undefined) {
    throw createError.NotFound(`Could not find user ${id}.`);
  }

  return getUserResult.response.user;
}
