import {
  BaseEvent,
  EventRequest,
  User as FusionAuthUser,
} from "@fusionauth/typescript-client";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { DecodedAccessToken } from "../data-models/interfaces/decoded-access-token.interface";

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

  if (!res.headersSent) {
    res.sendStatus(StatusCodes.OK);
  }
}

/**
 * Get the "user" property from a FusionAuth event.
 * @param event FusionAuth event
 * @returns FusionAuth user
 */
function getUserFromEvent(
  event: BaseEvent | undefined
): DecodedAccessToken | null {
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

  const appUser = user as DecodedAccessToken;
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
