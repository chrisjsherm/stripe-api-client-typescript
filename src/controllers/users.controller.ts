import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { associateUserWithCustomer$ } from "../helpers/associate-customer-with-user.helper";
import { createStripeCustomer$ } from "../helpers/create-stripe-customer.helper";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { refreshGroupMembership$ } from "../helpers/refresh-group-memberships.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Endpoints related to the application user.
 */
export const usersRouter = Router();
usersRouter.get("/me", getAuthenticatedUserProfile);
usersRouter.post("/me/customer", createCustomer);
usersRouter.post("/verify-email", resendEmailVerificationMessage);
usersRouter.post("/refresh-group-memberships", refreshGroupMemberships);

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);
const authClient = getFusionAuth(config);

/**
 * Create a customer associated with the authenticated user.
 * @param req HTTP request
 * @param res HTTP response
 */
async function createCustomer(req: Request, res: Response): Promise<void> {
  console.info("Received create customer request.");

  try {
    const token = decodeFusionAuthAccessToken(req);
    const userQueryResult = await getAuthUserById$(token.userId, authClient);

    if (
      userQueryResult.data?.[
        ConstantConfiguration.fusionAuth_user_data_stripeCustomerId
      ] !== undefined
    ) {
      throw createError.Conflict(
        "This user is already associated with a Stripe customer."
      );
    }

    const customer = await createStripeCustomer$(token, stripeClient);
    await associateUserWithCustomer$(token.userId, customer.id, authClient);

    if (!res.headersSent) {
      res.status(StatusCodes.CREATED).send({
        data: { stripeCustomerId: customer.id },
      });
    }
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred creating the Stripe customer.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get the user profile for the user who initiated this request.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getAuthenticatedUserProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = decodeFusionAuthAccessToken(req);
    res.send({
      data: token,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error getting authenticated user's profile.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Resend a message asking the customer to verify his email.
 * @param req HTTP request
 * @param res HTTP response
 */
async function resendEmailVerificationMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email: userEmail } = decodeFusionAuthAccessToken(req);
    const result = await authClient.resendEmailVerification(userEmail);

    if (result.exception) {
      return onErrorProcessingHttpRequest(
        result.exception,
        result.exception.message,
        result.statusCode,
        res
      );
    }

    res.status(StatusCodes.CREATED).send({
      data: {
        sentTimestampUtcMs: new Date().getTime(),
      },
    });
  } catch (e) {
    onErrorProcessingHttpRequest(
      e,
      "Error resending verification email.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Refresh the authenticated user's group memberships.
 * @param req HTTP request
 * @param res HTTP response
 */
async function refreshGroupMemberships(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = decodeFusionAuthAccessToken(req);
    await refreshGroupMembership$(token, stripeClient, authClient);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    onErrorProcessingHttpRequest(
      error,
      `Error refreshing user's group memberships.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
