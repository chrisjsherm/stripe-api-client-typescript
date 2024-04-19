import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { createCustomerContact } from "./controllers/create-contact-message.controller";
import { createPaymentIntent } from "./controllers/create-payment-intent.controller";
import { getPaymentIntent } from "./controllers/get-payment-intent.controller";
import { onFusionAuthEvent } from "./controllers/on-fusion-auth-event.controller";
import { onStripeEvent } from "./controllers/on-stripe-event.controller";
import {
  createOrganization,
  getUserOrganization,
} from "./controllers/organization.controller";
import { usersRouter } from "./controllers/users.controller";
import { contactFormJsonSchema } from "./data-models/interfaces/contact-form.interface";
import { createOrganizationJsonSchema } from "./data-models/json-schemas/organization-create.json-schema";
import { getEnvironmentConfiguration } from "./helpers/get-environment-configuration.helper";
import { hasAnyRole } from "./helpers/has-any-role.helper";
import { generateRequestBodyValidator } from "./helpers/validate-request-body.middleware";
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

  // Contact Us API
  app.post(
    "/contact-us",
    generateRequestBodyValidator(contactFormJsonSchema),
    createCustomerContact
  );

  // Configuration for API endpoints that require authentication.
  app.use(verifyApiJwt$);

  // Organization API
  app.post(
    "/organization",
    hasAnyRole([]),
    generateRequestBodyValidator(createOrganizationJsonSchema),
    createOrganization
  );
  app.get("/organization", hasAnyRole([]), getUserOrganization);

  // Stripe API
  app.post("/payment-intent", hasAnyRole([]), createPaymentIntent);
  app.post("/payment-intent/:id", hasAnyRole([]), getPaymentIntent);

  // Users API
  app.use("/users", usersRouter);

  try {
    await app.listen(config.port);
    console.info(`🚀 Server running at http://localhost:${config.port}`);
  } catch (error) {
    console.error("❗️ Error starting server", error);
    throw error;
  }
}
