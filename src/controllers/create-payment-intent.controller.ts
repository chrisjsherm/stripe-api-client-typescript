import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import Stripe from "stripe";
import { getCustomerInfo } from "../helpers/get-customer-info.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import getStripe from "../helpers/get-stripe.helper";
import { handleStripeApiError } from "../helpers/handle-stripe-error.helper";

const config = getEnvironmentConfiguration();
const stripe = getStripe(config);

/**
 * Create a Stripe PaymentIntent and return the unique identifier to the client.
 * @param _req HTTP request
 * @param res HTTP response
 */
export async function createPaymentIntent(
  req: Request,
  res: Response
): Promise<void> {
  const { id: customerId, email: customerEmail } = getCustomerInfo(req);
  if (customerId === undefined || customerEmail === undefined) {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).json({
      message: getReasonPhrase(statusCode),
    });
    return;
  }

  // Create a PaymentIntent with the order amount and currency.
  const params: Stripe.PaymentIntentCreateParams = {
    amount: 1099,
    automatic_payment_methods: {
      enabled: true,
    },
    currency: "usd",
    description: "BTX Now annual subscription",
    metadata: {
      customer_id: customerId,
    },
    receipt_email: customerEmail,
    statement_descriptor: "BTX Now 1 yr subscribe",
    statement_descriptor_suffix: "BTX Now 1 yr subscribe",
  };

  res.type("application/json");
  try {
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create(params);

    res.send({
      data: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    handleStripeApiError(err, "❗️ Error creating payment intent.", res);
  }
}
