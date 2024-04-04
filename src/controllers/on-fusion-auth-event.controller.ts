import {
  EventRequest,
  EventType,
  UserEmailVerifiedEvent,
} from "@fusionauth/typescript-client";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getOrCreateStripeCustomerByFusionAuthUser$ } from "../helpers/get-or-create-stripe-customer-by-fusion-auth-user.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);

/**
 * Handle FusionAuth events via this webhook.
 * FusionAuth must be configured to use this endpoint via CLI or dashboard.
 * @param req HTTP request
 * @param res HTTP response
 * @param buf HTTP buffer
 */
export async function onFusionAuthEvent(
  req: Request,
  res: Response
): Promise<void> {
  const { event } = JSON.parse(req.body.toString()) as EventRequest;
  console.info(`FusionAuth event: ${event?.type}`);

  try {
    switch (event?.type) {
      case EventType.UserEmailVerified:
        const emailVerifiedEvent = event as UserEmailVerifiedEvent;
        if (
          emailVerifiedEvent.user?.id === undefined ||
          emailVerifiedEvent.user?.email === undefined
        ) {
          throw createHttpError.BadRequest(
            'FusionAuth "UserEmailVerifiedEvent" did not set "user" property.'
          );
        }

        // Use get-or-create to handle possible duplicate events from retries.
        await getOrCreateStripeCustomerByFusionAuthUser$(
          {
            ...emailVerifiedEvent.user,
            emailVerified: emailVerifiedEvent.user.verified ?? false,
          } as AppUser,
          stripeClient
        );
        break;
    }
  } catch (error) {
    let message = "Error processing FusionAuth event.";
    if (event) {
      message = `${message} Details: ${event?.id} ${event?.type}`;
    }

    return onErrorProcessingHttpRequest(
      error,
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }

  res.sendStatus(StatusCodes.OK);
}
