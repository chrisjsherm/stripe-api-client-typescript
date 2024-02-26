import { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import * as jose from "jose";

const COOKIE_KEY_ACCESS_TOKEN = "app.at";
const jwksClient = jose.createRemoteJWKSet(
  new URL(`${process.env.AUTH_BASE_URL}/.well-known/jwks.json`)
);

/**
 * Verify the JSON Web Token is valid.
 * @param req HTTP request
 * @param res HTTP response
 * @param next Callback to initiate next handler in ExpressJS chain
 */
export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader ? authHeader.split(" ")[1] : null;

  let accessToken = bearerToken;
  // Prefer cookies for security.
  if (req.cookies && req.cookies[COOKIE_KEY_ACCESS_TOKEN]) {
    accessToken = req.cookies[COOKIE_KEY_ACCESS_TOKEN];
  }

  if (!accessToken) {
    const message = "Missing authentication token.";
    res.status(401);
    res.send({ message });
    next(new Error(message));
  } else {
    try {
      await jose.jwtVerify(accessToken, jwksClient, {
        issuer: process.env.AUTH_BASE_URL,
        audience: process.env.AUTH_FUSION_AUTH_CLIENT_ID,
      });

      (req as Request & { verifiedToken: string }).verifiedToken = accessToken;
      next();
    } catch (e) {
      if (e instanceof jose.errors.JOSEError) {
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
