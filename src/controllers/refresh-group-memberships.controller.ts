import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { getUserInfo } from "../helpers/get-user-info.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { refreshGroupMembership$ } from "../helpers/refresh-group-memberships.helper";

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);
const authClient = getFusionAuth(config);

/**
 * Refresh the authenticated user's group memberships.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function refreshGroupMemberships(
  req: Request,
  res: Response
): Promise<void> {
  const { id: userId, email: userEmail } = getUserInfo(req);
  if (userId === undefined || userEmail === undefined) {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).json({
      message: getReasonPhrase(statusCode),
    });
    return;
  }

  try {
    await refreshGroupMembership$(
      { id: userId, email: userEmail },
      stripeClient,
      authClient
    );

    res.status(StatusCodes.OK).send();
  } catch (error) {
    onErrorProcessingHttpRequest(
      error,
      `❗️ Error refreshing user ${userId}'s group memberships.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
