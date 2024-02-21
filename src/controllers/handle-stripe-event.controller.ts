import { Request, Response } from "express";
import Stripe from "stripe";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import getStripe from "../helpers/get-stripe.helper";

const config = getEnvironmentConfiguration();
const stripe = getStripe(config);

/**
 * Handle Stripe events via this webhook endpoint.
 * Stripe must be configured to use this endpoint via the CLI or Stripe Dashboard.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function handleStripeEvent(
  req: Request,
  res: Response
): Promise<void> {
  const signature = req.headers["stripe-signature"] ?? "";
  const secret = config.payments.webhookSigningSecret;

  if (secret === undefined) {
    const error = new Error(
      "Environment variable STRIPE_WEBHOOK_SECRET is not set."
    );
    console.error(`❗️ ${error.message}`);
    throw error;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (err) {
    console.error(`❗️ Webhook signature verification failed.`);
    res.sendStatus(400);
    return;
  }

  // Extract the data from the event.
  const data: Stripe.Event.Data = event.data;
  const eventType: string = event.type;

  if (eventType === "payment_intent.succeeded") {
    // Cast the event into a PaymentIntent to make use of the types.
    const paymentIntent: Stripe.PaymentIntent =
      data.object as Stripe.PaymentIntent;
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
    console.info(
      `🔔  Webhook received on ${new Date(
        event.created * 1000
      ).toUTCString()}: ${paymentIntent.object} ${paymentIntent.status}`
    );
    console.info(`${new Date().toUTCString()}: 💰 Payment captured `);
  } else if (eventType === "payment_intent.payment_failed") {
    // Cast the event into a PaymentIntent to make use of the types.
    const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
    console.info(
      `🔔  Webhook received on ${new Date(
        event.created * 1000
      ).toUTCString()}: ${pi.object} ${pi.status}`
    );
    console.error(`${new Date().toUTCString()}: ❗️ Payment failed.`);
  }
  res.sendStatus(200);
}
