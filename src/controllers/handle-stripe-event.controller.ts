import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { handleError } from "../helpers/handle-error.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);
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
    const message = "Environment variable STRIPE_WEBHOOK_SECRET is not set.";
    const error = new Error(message);
    return handleError(error, message, StatusCodes.INTERNAL_SERVER_ERROR, res);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (err) {
    const message = `❗️ Webhook signature verification failed.`;
    return handleError(err, message, StatusCodes.BAD_REQUEST, res);
  }

  const data: Stripe.Event.Data = event.data;
  const eventType: string = event.type;

  console.info(
    `🔔 Stripe event occurred on ${new Date(
      event.created * 1000
    ).toUTCString()}: ${eventType}`
  );

  switch (eventType) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceededEvent(
        data.object as Stripe.PaymentIntent,
        res
      );
      break;

    case "payment_intent.payment_failed":
      handlePaymentIntentFailedEvent(data.object as Stripe.PaymentIntent);
      break;
  }

  if (!res.headersSent) {
    res.sendStatus(StatusCodes.OK);
  }
}

/**
 * Handle a PaymentIntent success event.
 * @param paymentIntent Payment intent from which the successful charge originated
 * @param res HTTP response
 * @returns Promise
 */
async function handlePaymentIntentSucceededEvent(
  paymentIntent: Stripe.PaymentIntent,
  res: Response
): Promise<void> {
  console.info(
    `${new Date().toUTCString()}:💰 Payment captured for payment intent ${
      paymentIntent.id
    }.`
  );

  const groupId = ConstantConfiguration.auth_group_id_facilityManagers;
  const customerId: string | undefined =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadataKey_customerId
    ];
  if (customerId === undefined) {
    const message =
      `❗️ Payment intent ${paymentIntent.id} does not have a customer ID ` +
      "associated with it.";
    const err = new Error(message);
    return handleError(err, message, StatusCodes.BAD_REQUEST, res);
  }

  try {
    await authClient.createGroupMembers({
      members: {
        [groupId]: [
          {
            userId: customerId,
            data: {
              [ConstantConfiguration.auth_group_metadataKey_paymentIntentId]:
                paymentIntent.id,
            },
          },
        ],
      },
    });
    console.info(`🔔 Added customer ${customerId} to group ${groupId}.`);

    res.sendStatus(StatusCodes.OK);
    return;
  } catch (err) {
    const message =
      `❗️ Failed to add customer with ID ${customerId} to group ` +
      `with ID ${groupId}`;
    return handleError(err, message, StatusCodes.BAD_GATEWAY, res);
  }
}

/**
 * Handle a PaymentIntent failed event.
 * @param paymentIntent PaymentIntent for which the charge failed
 */
function handlePaymentIntentFailedEvent(
  paymentIntent: Stripe.PaymentIntent
): void {
  console.info(
    `${new Date().toUTCString()}: ❗️ Payment failed for payment intent ${
      paymentIntent.id
    }.`
  );
}
