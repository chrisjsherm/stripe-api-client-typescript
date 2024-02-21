import { Request } from "express";
import { JWTPayload, decodeJwt } from "jose";

/**
 * Get metadata about the customer who initiated the request.
 * @param req HTTP request
 * @returns Customer information
 */
export function getCustomerInfo(req: Request): {
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
