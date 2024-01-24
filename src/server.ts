import cors from "cors";
import express from "express";
import { getEnvironmentConfiguration } from "./helpers/get-environment-configuration.helper";
import { createPaymentIntent } from "./resolvers/create-payment-intent.resolver";
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
    })
  );

  app.post("/payment-intent", createPaymentIntent);
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
