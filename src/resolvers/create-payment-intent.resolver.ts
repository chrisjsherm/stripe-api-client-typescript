import { Request, Response } from "express";
import Stripe from "stripe";
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
  _req: Request,
  res: Response
): Promise<void> {
  // Create a PaymentIntent with the order amount and currency.
  const params: Stripe.PaymentIntentCreateParams = {
    amount: 1099,
    automatic_payment_methods: {
      enabled: true,
    },
    currency: "usd",
    description: "BTX Now annual subscription",
    statement_descriptor: "BTX Now 1 yr subscribe",
    statement_descriptor_suffix: "BTX Now 1 yr subscribe",
  };

  res.type("application/json");
  try {
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create(params);

    res.send({
      data: {
        client_secret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    handleStripeApiError(err, "❗️ Error creating payment intent.", res);
  }
}
