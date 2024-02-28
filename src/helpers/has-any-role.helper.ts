import { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { JWTPayload, decodeJwt } from "jose";

/**
 * Determine whether a verified customer has any of the required roles for the
 * protected resource. Unverified customers will automatically be denied.
 * @param roles Roles which have access to the resource
 */
export function hasAnyRole(roles: string[]) {
  return function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const authToken: JWTPayload & { email_verified: boolean; roles: string[] } =
      decodeJwt((req as Request & { verifiedToken: string }).verifiedToken);
    const userRoles = new Set<string>(authToken.roles);

    if (
      authToken.email_verified &&
      (roles.length === 0 ||
        roles.some((role: string): boolean => {
          return userRoles.has(role);
        }))
    ) {
      return next();
    }

    const code = StatusCodes.FORBIDDEN;
    const message = `${getReasonPhrase(
      code
    )}: You are not authorized to access this resource.`;
    res.status(code);
    res.send({ message });
    next(new Error(message));
  };
}
