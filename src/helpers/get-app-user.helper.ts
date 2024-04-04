import { Request } from "express";
import * as createError from "http-errors";
import { JWTPayload, decodeJwt } from "jose";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { IFusionAuthJwt } from "../data-models/interfaces/fusion-auth-jwt.interface";

/**
 * Get user who initiated the request.
 * @param req HTTP request
 * @returns User information
 * @throws Error
 */
export function getAppUser(req: Request): AppUser {
  const authToken: JWTPayload & IFusionAuthJwt = decodeJwt(
    (req as Request & { verifiedToken: string }).verifiedToken
  );

  if (authToken.sub === undefined || authToken.email === undefined) {
    throw createError.Unauthorized();
  }

  return {
    id: authToken.sub,
    email: authToken.email,
    emailVerified: authToken.email_verified ?? false,
    fullName: authToken.full_name,
    mobilePhone: authToken.mobile_phone,
    organizationId: authToken.organization_id,
  };
}
