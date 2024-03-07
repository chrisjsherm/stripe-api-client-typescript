import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import Stripe from "stripe";
import { getCustomerInfo } from "../helpers/get-customer-info.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { getOrCreateStripeCustomer$ } from "../helpers/get-or-create-stripe-customer.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);
const authClient = getFusionAuth(config);

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
    const { id: customerId, email: customerEmail } = getCustomerInfo(req);
    if (customerId === undefined || customerEmail === undefined) {
      const statusCode = StatusCodes.UNAUTHORIZED;
      res.status(statusCode).json({
        message: getReasonPhrase(statusCode),
      });
      return;
    }

    const { id: stripeCustomerId } = await getOrCreateStripeCustomer$(
      customerId,
      customerEmail,
      stripeClient,
      authClient
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
          customerId,
        [ConstantConfiguration.stripe_paymentIntent_metadata_groupMembershipsCsv]:
          config.auth.groupId_subscriptionBasicAnnual,
      },
      receipt_email: customerEmail,
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
