import {
  BaseEvent,
  EventRequest,
  EventType,
  User as FusionAuthUser,
} from "@fusionauth/typescript-client";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { AppUser } from "../data-models/interfaces/app-user.interface";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getOrCreateStripeCustomerByUser$ } from "../helpers/get-or-create-stripe-customer-by-fusion-auth-user.helper";
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
  console.info(`FusionAuth event: ${event?.type ?? "unknown"}`);
  const user = getUserFromEvent(event);

  try {
    switch (event?.type) {
      case EventType.UserCreate:
        if (user === null) {
          throw getUserNotSetError(event.type);
        }

        await getOrCreateStripeCustomerByUser$(user, stripeClient);
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

  if (!res.headersSent) {
    res.sendStatus(StatusCodes.OK);
  }
}

/**
 * Get the "user" property from a FusionAuth event.
 * @param event FusionAuth event
 * @returns FusionAuth user
 */
function getUserFromEvent(event: BaseEvent | undefined): AppUser | null {
  if (event === undefined) {
    return null;
  }

  const { user } = event as { user?: FusionAuthUser };

  if (
    user === undefined ||
    user.id === undefined ||
    user.email === undefined ||
    user.firstName === undefined ||
    user.lastName === undefined ||
    user.verified === undefined
  ) {
    return null;
  }

  const appUser = user as AppUser;
  appUser.emailVerified = user.verified;
  return appUser;
}

/**
 * Get exception because the event did not properly set the "user" property.
 * @param eventType FusionAuth event type
 */
function getUserNotSetError(eventType: string): createHttpError.HttpError<400> {
  return createHttpError.BadRequest(
    `FusionAuth event "${eventType}" did not properly set the user property.`
  );
}
