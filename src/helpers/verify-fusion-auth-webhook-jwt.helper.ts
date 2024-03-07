import * as crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { jwtVerify } from "jose";
import { getJwksClient } from "./get-jwks-client.helper";
import { onErrorProcessingHttpRequest } from "./on-error-processing-http-request.helper";

const jwksClient = getJwksClient();
const signatureHeader = "X-FusionAuth-Signature-JWT";

/**
 * Verify the JSON Web Token for the FusionAuth webhook is valid.
 * @param req HTTP request
 * @param res HTTP response
 * @param next Callback to initiate next handler in ExpressJS chain
 *
 */
export async function verifyFusionAuthWebhookJwt$(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.get(signatureHeader);
    if (!token) {
      throw new Error("Missing JWT header.");
    }

    const jwt = Buffer.from(token, "utf8");
    const { payload } = await jwtVerify(jwt, jwksClient);
    const body_sha256 = crypto
      .createHash("sha256")
      .update(req.body)
      .digest("base64");

    // Compare digest signature with signature sent by provider
    if (payload.request_body_sha256 !== body_sha256) {
      throw new Error("Invalid request body.");
    }

    next();
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Invalid JWT header.",
      StatusCodes.UNAUTHORIZED,
      res
    );
    next(err);
  }
}
