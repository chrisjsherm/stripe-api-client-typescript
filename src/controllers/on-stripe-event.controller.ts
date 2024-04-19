import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onCustomerCreatedEvent$ } from "../helpers/on-customer-created-event.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { onPaymentIntentFailedEvent } from "../helpers/on-stripe-payment-intent-failed.helper";
import { onPaymentIntentSucceededEvent$ } from "../helpers/on-stripe-payment-intent-succeeded.helper";

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);
const stripeClient = getStripe(config);
const signingKey = config.payments.webhookSigningKey;

/**
 * Handle Stripe events via this webhook.
 * Stripe must be configured to use this endpoint via the CLI or Stripe Dashboard.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function onStripeEvent(
  req: Request,
  res: Response
): Promise<void> {
  const signature = req.headers["stripe-signature"] ?? "";
  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      signingKey
    );
  } catch (err) {
    const message = `❗️ Stripe webhook signature verification failed.`;
    return onErrorProcessingHttpRequest(
      err,
      message,
      StatusCodes.BAD_REQUEST,
      res
    );
  }

  const data: Stripe.Event.Data = event.data;
  const eventType: string = event.type;

  console.info(
    `🔔 Stripe event occurred on ${new Date(
      event.created * 1000
    ).toUTCString()}: ${eventType}`
  );

  try {
    switch (eventType) {
      case "customer.created":
        await onCustomerCreatedEvent$(
          data.object as Stripe.Customer,
          authClient
        );
        break;

      case "payment_intent.succeeded":
        await onPaymentIntentSucceededEvent$(
          data.object as Stripe.PaymentIntent,
          config,
          authClient,
          stripeClient
        );
        break;

      case "payment_intent.payment_failed":
        onPaymentIntentFailedEvent(data.object as Stripe.PaymentIntent);
        break;
    }
  } catch (e) {
    return onErrorProcessingHttpRequest(
      e,
      "Error processing Stripe event.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }

  if (!res.headersSent) {
    res.sendStatus(StatusCodes.OK);
  }
}
