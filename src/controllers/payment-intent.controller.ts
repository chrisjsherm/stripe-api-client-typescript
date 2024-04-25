import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { getAppUser } from "../helpers/get-app-user.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getOrCreateStripeCustomerByUser$ } from "../helpers/get-or-create-stripe-customer-by-fusion-auth-user.helper";
import { getStripeCustomerByUser$ } from "../helpers/get-stripe-customer-by-fusion-auth-user.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Payment intent endpoints
 */
export const paymentIntentsRouter = Router();
paymentIntentsRouter.post("/:id", getPaymentIntent);
paymentIntentsRouter.post("/", createPaymentIntent);

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);

/**
 * Create a Stripe PaymentIntent and return the unique identifier to the client.
 * @param _req HTTP request
 * @param res HTTP response
 */
export async function createPaymentIntent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = getAppUser(req);
    const { id: stripeCustomerId } = await getOrCreateStripeCustomerByUser$(
      user,
      stripeClient
    );

    const params: Stripe.PaymentIntentCreateParams = {
      amount: 1099,
      automatic_payment_methods: {
        enabled: true,
      },
      currency: "usd",
      customer: stripeCustomerId,
      description: "BTX Now annual subscription",
      metadata: {
        [ConstantConfiguration.stripe_paymentIntent_metadata_customerId]:
          user.id,
        [ConstantConfiguration.stripe_paymentIntent_metadata_groupMembershipsCsv]:
          config.auth.groupId_subscriptionBasicAnnual,
      },
      receipt_email: user.email,
      statement_descriptor: "BTX Now 1 yr subscribe",
      statement_descriptor_suffix: "BTX Now 1 yr subscribe",
    };

    const paymentIntent: Stripe.PaymentIntent =
      await stripeClient.paymentIntents.create(params);

    res.send({
      data: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "❗️ Error creating payment intent.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

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
        capture_method: paymentIntent.capture_method,
        client_secret: paymentIntent.client_secret,
        confirmation_method: paymentIntent.confirmation_method,
        created: paymentIntent.created,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        id: paymentIntent.id,
        last_payment_error: paymentIntent.last_payment_error,
        livemode: paymentIntent.livemode,
        next_action: paymentIntent.next_action,
        object: "payment_intent",
        payment_method: paymentIntent.payment_method,
        payment_method_types: paymentIntent.payment_method_types,
        receipt_email: paymentIntent.receipt_email,
        setup_future_usage: paymentIntent.setup_future_usage,
        shipping: paymentIntent.shipping,
        status: paymentIntent.status,
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
