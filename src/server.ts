import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { DataSource } from "typeorm";
import { createCustomerContact } from "./controllers/create-contact-message.controller";
import { handleLogout } from "./controllers/logout.controller";
import { onFusionAuthEvent } from "./controllers/on-fusion-auth-event.controller";
import { onStripeEvent } from "./controllers/on-stripe-event.controller";
import { organizationsRouter } from "./controllers/organization.controller";
import { patientsRouter } from "./controllers/patients.controller";
import { paymentIntentsRouter } from "./controllers/payment-intent.controller";
import { physicalLocationsRouter } from "./controllers/physical-locations.controller";
import { productSubscriptionsRouter } from "./controllers/product-subscriptions.controller";
import { productsRouter } from "./controllers/products.controller";
import { toxinTreatmentsRouter } from "./controllers/toxin-treatments.controller";
import { toxinsRouter } from "./controllers/toxins.controller";
import { usersRouter } from "./controllers/users.controller";
import { contactFormJsonSchema } from "./data-models/interfaces/contact-form.interface";
import { getEnvironmentConfiguration } from "./helpers/get-environment-configuration.helper";
import { hasAnyRole } from "./helpers/has-any-role.helper";
import { generateRequestBodyValidator } from "./helpers/validate-request-body.middleware";
import { verifyApiJwt$ } from "./helpers/verify-api-jwt.helper";
import { verifyFusionAuthWebhookJwt$ } from "./helpers/verify-fusion-auth-webhook-jwt.helper";

/**
 * Start the Express web server.
 * @param dataSource Database connection
 */
export async function startServer(dataSource: DataSource): Promise<void> {
  const config = getEnvironmentConfiguration();
  const app = express();

  /**
   * Configuration for all endpoints.
   */
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

  /**
   * Configuration for application API endpoints.
   */
  app.use(
    cors({
      origin: [config.uiOrigin],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(
    express.json({
      limit: config.http.payloadLimit,
    })
  );

  // Server health check.
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  // Contact Us API.
  app.post(
    "/contact-us",
    generateRequestBodyValidator(contactFormJsonSchema),
    createCustomerContact
  );

  // Logout API.
  app.get("/logout-succeeded", handleLogout);

  // Products API.
  app.use("/products", productsRouter);

  /**
   * Configuration for API endpoints that require authentication.
   */
  app.use(verifyApiJwt$);

  // Organizations API
  app.use("/organizations", organizationsRouter);

  // Locations API
  app.use("/organizations/me/physical-locations", physicalLocationsRouter);

  // Patients API.
  app.use("/organizations/me/patients", patientsRouter);

  // Payment Intents API
  app.use("/payment-intent", hasAnyRole([]), paymentIntentsRouter);

  // Product Subscriptions API.
  app.use("/product-subscriptions", productSubscriptionsRouter);

  // Toxins API.
  app.use("/organizations/me/botulinum-toxins", toxinsRouter);

  // Toxin Treatments API.
  app.use(
    "/organizations/me/botulinum-toxin-treatments",
    toxinTreatmentsRouter
  );

  // Users API
  app.use("/users", usersRouter);

  try {
    const server = await app.listen(config.port);
    console.info(`🚀 Server running on port ${config.port}`);

    // Handle termination signal.
    process.on("SIGTERM", async () => {
      console.info("🚦 SIGTERM received. Stopping HTTP server.");
      await server.close(async () => {
        console.info("🛑 HTTP server stopped.");
        console.info("🔌 Closing database connection.");
        await dataSource.destroy();
        console.info("🛑 Database connection closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❗️ Error starting server", error);
    throw error;
  }
}
