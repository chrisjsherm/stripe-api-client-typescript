import { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { errors, jwtVerify } from "jose";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { getEnvironmentConfiguration } from "./get-environment-configuration.helper";
import { getJwksClient } from "./get-jwks-client.helper";

const config = getEnvironmentConfiguration();
const accessTokenCookie = ConstantConfiguration.fusionAuth_accessTokenCookie;
const jwksClient = getJwksClient();

/**
 * Verify the JSON Web Token for the API request is valid.
 * @param req HTTP request
 * @param res HTTP response
 * @param next Callback to initiate next handler in ExpressJS chain
 * @returns Promise
 */
export async function verifyApiJwt$(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader ? authHeader.split(" ")[1] : null;

  let accessToken = bearerToken;
  // Prefer cookies for security.
  if (req.cookies && req.cookies[accessTokenCookie]) {
    accessToken = req.cookies[accessTokenCookie];
  }

  if (!accessToken) {
    const message = "Missing authentication token.";
    res.status(StatusCodes.UNAUTHORIZED);
    res.send({ message });
    next(new Error(message));
  } else {
    try {
      await jwtVerify(accessToken, jwksClient, {
        issuer: config.auth.url,
        audience: config.auth.appId,
      });

      (req as Request & { verifiedToken: string }).verifiedToken = accessToken;
      next();
    } catch (e) {
      if (e instanceof errors.JOSEError) {
        res.status(401);
        res.send({ message: e.message, code: e.code });
      } else {
        const code = StatusCodes.INTERNAL_SERVER_ERROR;
        console.error(getReasonPhrase(code) + ":");
        console.dir(e);
        res.status(code);
        res.send({ message: JSON.stringify(e, null, 2) });
      }
      next(e);
    }
  }
}
