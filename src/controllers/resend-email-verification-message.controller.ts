import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { getUserInfo } from "../helpers/get-user-info.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Resend a message asking the customer to verify his email.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function resendEmailVerificationMessage(
  req: Request,
  res: Response
): Promise<void> {
  const { email: userEmail } = getUserInfo(req);

  if (userEmail === undefined) {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).json({
      message: getReasonPhrase(statusCode),
    });
    return;
  }

  try {
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
