import { Request } from "express";
import * as createError from "http-errors";
import { JWTPayload, decodeJwt } from "jose";
import { DecodedAccessToken } from "../data-models/interfaces/decoded-access-token.interface";
import { IFusionAuthJwt } from "../data-models/interfaces/fusion-auth-jwt.interface";

/**
 * Decode FusionAuth access token in order to read its claims.
 * @param req HTTP request
 * @returns User information
 * @throws Error
 */
export function decodeFusionAuthAccessToken(req: Request): DecodedAccessToken {
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
    firstName: authToken.first_name,
    lastName: authToken.last_name,
    roles: authToken.roles,
    mobilePhone: authToken.mobile_phone,
    organizationId: authToken.organization_id,
    stripeCustomerId: authToken.stripe_customer_id,
  };
}
