import { Request, Response } from "express";
import Stripe from "stripe";
import getStripe from "../helpers/get-stripe.helper";

const stripe = getStripe();

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

  try {
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create(params);

    // Send publishable key and PaymentIntent client_secret to client.
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.error("❗️ Error creating payment intent.", e);

    res.status(400).send({
      error: {
        message: (e as Error).message,
      },
    });
  }
}
