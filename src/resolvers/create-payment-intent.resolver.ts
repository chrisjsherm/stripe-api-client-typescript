import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import getStripe from "../helpers/get-stripe.helper";

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
    currency: "USD",
    automatic_payment_methods: {
      enabled: true,
    },
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
    const defaultMessage = "❗️Error creating payment intent.";
    console.error(defaultMessage, err);

    if (err instanceof Stripe.errors.StripeError) {
      res
        .status(err.statusCode ?? StatusCodes.BAD_GATEWAY)
        .send({ message: err.message });
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: defaultMessage,
    });
  }
}
