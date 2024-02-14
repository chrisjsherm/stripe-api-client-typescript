import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getEnvironmentConfiguration } from "./helpers/get-environment-configuration.helper";
import { hasRole } from "./helpers/has-role.helper";
import { verifyJWT } from "./helpers/verify-jwt.helper";
import { createPaymentIntent } from "./resolvers/create-payment-intent.resolver";
import { getPaymentIntent } from "./resolvers/get-payment-intent.controller";
import { handleStripeEvent } from "./resolvers/handle-stripe-event.resolver";

/**
 * Start the Express web server.
 */
export async function startServer() {
  const config = getEnvironmentConfiguration();
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(function configureTimeout(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.setTimeout(config.httpRequestTimeoutMs, () => {
      const statusCode = StatusCodes.REQUEST_TIMEOUT;
      res.status(statusCode).json({ message: getReasonPhrase(statusCode) });
    });

    next();
  });
  app.use(verifyJWT);

  app.post("/payment-intent", hasRole(["make-payments"]), createPaymentIntent);
  app.post("/payment-intent/:id", hasRole(["make-payments"]), getPaymentIntent);
  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleStripeEvent
  );

  try {
    await app.listen(config.port);
    console.info(`🚀 Server running at http://localhost:${config.port}`);
  } catch (error) {
    console.error("❗️ Error starting server", error);
    throw error;
  }
}
