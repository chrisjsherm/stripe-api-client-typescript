import { Request, Response } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getAppUser } from "../helpers/get-app-user.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getStripeCustomerByUser$ } from "../helpers/get-stripe-customer-by-fusion-auth-user.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);

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

  try {
    const user = getAppUser(req);
    const customer = await getStripeCustomerByUser$(user, stripeClient);
    if (customer === null) {
      throw createError.NotFound(
        `Did not find Stripe customer associated with user ${user.id}.`
      );
    }

    const paymentIntent: Stripe.Response<Stripe.PaymentIntent> =
      await stripeClient.paymentIntents.retrieve(id);

    if (!paymentIntent.customer || paymentIntent.customer !== customer.id) {
      throw createError.Unauthorized(
        "Authenticated customer does not match the customer on the PaymentIntent."
      );
    }

    res.send({
      data: {
        amount: paymentIntent.amount,
        canceled_at: paymentIntent.canceled_at,
        cancellation_reason: paymentIntent.cancellation_reason,
        client_secret: paymentIntent.client_secret,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        id: paymentIntent.id,
        last_payment_error: paymentIntent.last_payment_error,
        payment_method: paymentIntent.payment_method,
        receipt_email: paymentIntent.receipt_email,
        status: paymentIntent.status,
        statement_descriptor: paymentIntent.statement_descriptor,
        statement_descriptor_suffix: paymentIntent.statement_descriptor_suffix,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "❗️Error retrieving payment intent.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
