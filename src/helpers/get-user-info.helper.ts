import { Request } from "express";
import * as createError from "http-errors";
import { JWTPayload, decodeJwt } from "jose";
import { AppUser } from "../data-models/interfaces/app-user.interface";

/**
 * Get metadata about the user who initiated the request.
 * @param req HTTP request
 * @returns User information
 * @throws Error
 */
export function getUserInfo(req: Request): AppUser {
  const authToken: JWTPayload & { email: string | undefined } = decodeJwt(
    (req as Request & { verifiedToken: string }).verifiedToken
  );

  if (authToken.sub === undefined || authToken.email === undefined) {
    throw createError.Unauthorized();
  }

  return {
    id: authToken.sub,
    email: authToken.email,
  };
}
