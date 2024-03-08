import { Request } from "express";
import { JWTPayload, decodeJwt } from "jose";

/**
 * Get metadata about the user who initiated the request.
 * @param req HTTP request
 * @returns User information
 */
export function getUserInfo(req: Request): {
  id: string | undefined;
  email: string | undefined;
} {
  const authToken: JWTPayload & { email: string | undefined } = decodeJwt(
    (req as Request & { verifiedToken: string }).verifiedToken
  );

  return {
    id: authToken.sub,
    email: authToken.email,
  };
}
