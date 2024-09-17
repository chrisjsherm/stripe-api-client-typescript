import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { Organization } from "../data-models/entities/organization.entity";
import { Product } from "../data-models/entities/product.entity";
import { createPaymentIntentRequestBodyJsonSchema } from "../data-models/interfaces/create-payment-intent-request-body.json-schema";
import { IOrganization } from "../data-models/interfaces/organization.interface";
import { AppDataSource } from "../db/data-source";
import { associateUserWithCustomer$ } from "../helpers/associate-customer-with-user.helper";
import { createStripeCustomer$ } from "../helpers/create-stripe-customer.helper";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateRequestBodyValidator } from "../helpers/validate-request-body.middleware";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Payment intent endpoints
 */
export const paymentIntentsRouter = Router();
paymentIntentsRouter.post("/:id", getPaymentIntent);
paymentIntentsRouter.post(
  "/",
  generateRequestBodyValidator(createPaymentIntentRequestBodyJsonSchema),
  createPaymentIntent
);

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
    const productId: string = req.body.productId;
    const requestBodyOrganization: IOrganization = req.body.organization;

    const token = decodeFusionAuthAccessToken(req);

    if (!token.organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }
    // Overwrite request body with authenticated user value to prevent funny business.
    requestBodyOrganization.id = token.organizationId;

    if (productId === undefined) {
      throw createError.BadRequest("The request body is missing a product ID.");
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOneBy({
      id: productId,
    });
    if (product === null) {
      throw createError.BadRequest(
        `We cannot locate a product with ID ${productId}.`
      );
    }

    const userQueryResult = await getAuthUserById$(
      token.id,
      token.organizationId,
      authClient
    );
    let customerId: string | undefined =
      userQueryResult.data?.[
        ConstantConfiguration.fusionAuth_user_data_stripeCustomerId
      ];
    if (customerId == null) {
      const customer = await createStripeCustomer$(token, stripeClient);
      customerId = customer.id;
      await associateUserWithCustomer$(token.id, customer.id, authClient);
    }
    const organizationRepository = AppDataSource.getRepository(Organization);
    const existingOrganization = await organizationRepository.findOneOrFail({
      where: { id: token.organizationId },
    });

    // Make updates based on request body.
    existingOrganization.name = requestBodyOrganization.name;
    existingOrganization.mailingAddress.city =
      requestBodyOrganization.mailingAddress.city;
    existingOrganization.mailingAddress.country =
      requestBodyOrganization.mailingAddress.country;
    existingOrganization.mailingAddress.postalCode =
      requestBodyOrganization.mailingAddress.postalCode;
    existingOrganization.mailingAddress.state =
      requestBodyOrganization.mailingAddress.state;
    existingOrganization.mailingAddress.street1 =
      requestBodyOrganization.mailingAddress.street1;
    existingOrganization.mailingAddress.street2 =
      requestBodyOrganization.mailingAddress.street2 ?? null;
    existingOrganization.mailingAddress.streetAddressType =
      requestBodyOrganization.mailingAddress.streetAddressType;
    await existingOrganization.save();

    const params: Stripe.PaymentIntentCreateParams = {
      amount: product.priceInBaseUnits,
      automatic_payment_methods: {
        enabled: true,
      },
      currency: product.currencyCode,
      customer: customerId,
      description: product.subtitle,
      metadata: {
        [ConstantConfiguration.stripe_paymentIntent_metadata_userId]: token.id,
        [ConstantConfiguration.stripe_paymentIntent_metadata_organizationId]:
          existingOrganization.id,
        [ConstantConfiguration.stripe_paymentIntent_metadata_productIdsCsv]:
          product.id,
      },
      receipt_email: token.email,
      shipping: {
        address: {
          city: requestBodyOrganization.mailingAddress.city,
          country: requestBodyOrganization.mailingAddress.country,
          line1: requestBodyOrganization.mailingAddress.street1,
          line2: requestBodyOrganization.mailingAddress.street2 ?? undefined,
          postal_code: requestBodyOrganization.mailingAddress.postalCode,
          state: requestBodyOrganization.mailingAddress.state,
        },
        name: requestBodyOrganization.name,
      },
      statement_descriptor_suffix: product.statementDescriptorSuffix,
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
      "Error creating payment intent.",
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
    const token = decodeFusionAuthAccessToken(req);

    const paymentIntent: Stripe.Response<Stripe.PaymentIntent> =
      await stripeClient.paymentIntents.retrieve(id);

    if (
      !paymentIntent.customer ||
      paymentIntent.customer !== token.stripeCustomerId
    ) {
      throw createError.Forbidden(
        "You are not permitted to query payment intents for which you are " +
          "not the customer."
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
