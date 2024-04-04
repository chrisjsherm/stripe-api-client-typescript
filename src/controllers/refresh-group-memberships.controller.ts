import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getAppUser } from "../helpers/get-app-user.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
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
  try {
    const user = getAppUser(req);
    await refreshGroupMembership$(user, stripeClient, authClient);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    onErrorProcessingHttpRequest(
      error,
      `❗️ Error refreshing user's group memberships.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
