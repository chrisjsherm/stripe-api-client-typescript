import {
  EventRequest,
  EventType,
  UserEmailVerifiedEvent,
} from "@fusionauth/typescript-client";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { createStripeCustomer$ } from "../helpers/create-stripe-customer.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);
const stripeClient = getStripe(config);

/**
 * Handle FusionAuth events via this webhook.
 * FusionAuth must be configured to use this endpoint via CLI or dashboard.
 * @param req HTTP request
 * @param res HTTP response
 * @param buf HTTP buffer
 */
export async function handleFusionAuthEvent(
  req: Request,
  res: Response
): Promise<void> {
  const { event } = JSON.parse(req.body.toString()) as EventRequest;
  console.info(`FusionAuth event: ${event?.type}`);
  try {
    switch (event?.type) {
      case EventType.UserEmailVerified:
        const emailVerifiedEvent = event as UserEmailVerifiedEvent;
        if (emailVerifiedEvent.user?.id === undefined) {
          throw createHttpError.BadGateway(
            'FusionAuth UserEmailVerifiedEvent did not set "user" property.'
          );
        }

        await createStripeCustomer$(
          (event as UserEmailVerifiedEvent).user!.id!,
          authClient,
          stripeClient
        );
        break;
    }

    res.json({ message: "Processed" });
  } catch (error) {
    let message = "Error processing FusionAuth event.";
    if (event) {
      message = `${message} Details: ${event?.id} ${event?.type}`;
    }

    onErrorProcessingHttpRequest(
      error,
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
