import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import getStripe from "../helpers/get-stripe.helper";
import { handleStripeApiError } from "../helpers/handle-stripe-error.helper";

const config = getEnvironmentConfiguration();
const stripe = getStripe(config);

/**
 * Retrieve details about a PaymentIntent from the Stripe API.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function getPaymentIntent(
  req: Request,
  res: Response
): Promise<void> {
  res.type("application/json");

  const id = req.params.id;
  if (id === undefined || id === "") {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: 'URL parameter "id" is not set.' });
    return;
  }

  const clientSecret = req.body.clientSecret;

  try {
    const paymentIntent: Stripe.Response<Stripe.PaymentIntent> =
      await stripe.paymentIntents.retrieve(id);

    res.send({
      data: {
        amount: paymentIntent.amount,
        client_secret: paymentIntent.client_secret,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        id: paymentIntent.id,
        last_payment_error: paymentIntent.last_payment_error,
        receipt_email: paymentIntent.receipt_email,
        status: paymentIntent.status,
      },
    });
  } catch (err) {
    handleStripeApiError(err, "❗️Error retrieving payment intent.", res);
  }
}
