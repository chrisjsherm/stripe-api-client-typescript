import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { createPaymentIntent } from "./controllers/create-payment-intent.controller";
import { getPaymentIntent } from "./controllers/get-payment-intent.controller";
import { onFusionAuthEvent } from "./controllers/on-fusion-auth-event.controller";
import { onStripeEvent } from "./controllers/on-stripe-event.controller";
import { refreshGroupMemberships } from "./controllers/refresh-group-memberships.controller";
import { resendEmailVerificationMessage } from "./controllers/resend-email-verification-message.controller";
import { getEnvironmentConfiguration } from "./helpers/get-environment-configuration.helper";
import { hasAnyRole } from "./helpers/has-any-role.helper";
import { verifyApiJwt$ } from "./helpers/verify-api-jwt.helper";
import { verifyFusionAuthWebhookJwt$ } from "./helpers/verify-fusion-auth-webhook-jwt.helper";

/**
 * Start the Express web server.
 */
export async function startServer() {
  const config = getEnvironmentConfiguration();
  const app = express();

  // Configuration for all endpoints.
  app.use(function configureTimeout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.setTimeout(config.http.requestTimeoutMs, () => {
      console.info(
        `❗️ Timing out request ${req.method} ${req.url} after ${config.http.requestTimeoutMs} ms.`
      );
      const statusCode = StatusCodes.REQUEST_TIMEOUT;
      res.status(statusCode).json({ message: getReasonPhrase(statusCode) });
    });

    next();
  });

  // Stripe events webhook.
  app.post(
    "/webhooks/stripe",
    express.raw({
      type: "application/json",
      limit: config.http.payloadLimit,
    }),
    onStripeEvent
  );

  // FusionAuth events webhook.
  app.post(
    "/webhooks/fusion-auth",
    express.raw({
      type: "application/json",
      limit: config.http.payloadLimit,
    }),
    verifyFusionAuthWebhookJwt$,
    onFusionAuthEvent
  );

  // Configuration for API endpoints.
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(
    express.json({
      limit: config.http.payloadLimit,
    })
  );
  app.use(verifyApiJwt$);

  // FusionAuth API
  app.post("/customer/verify-email", resendEmailVerificationMessage);
  app.post("/customer/refresh-group-memberships", refreshGroupMemberships);

  // Stripe API
  app.post("/payment-intent", hasAnyRole([]), createPaymentIntent);
  app.post("/payment-intent/:id", hasAnyRole([]), getPaymentIntent);

  try {
    await app.listen(config.port);
    console.info(`🚀 Server running at http://localhost:${config.port}`);
  } catch (error) {
    console.error("❗️ Error starting server", error);
    throw error;
  }
}
