import express from "express";
import { createPaymentIntent } from "./resolvers/create-payment-intent.resolver";
import { handleStripeEvent } from "./resolvers/handle-stripe-event.resolver";

const DEFAULT_PORT = 4242;

/**
 * Start the Express web server.
 */
export async function startServer() {
  const app = express();

  app.post("/payment-intent", createPaymentIntent);
  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    handleStripeEvent
  );

  const port = process.env.PORT || DEFAULT_PORT;

  try {
    await app.listen(port);
    console.info(`🚀 Server running at http://localhost:${port}`);
  } catch (error) {
    console.error("❗️ Error starting server", error);
    throw error;
  }
}
