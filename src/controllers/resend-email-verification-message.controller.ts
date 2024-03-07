import { Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getCustomerInfo } from "../helpers/get-customer-info.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
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
  const { email: customerEmail } = getCustomerInfo(req);

  if (customerEmail === undefined) {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).json({
      message: getReasonPhrase(statusCode),
    });
    return;
  }

  try {
    const result = await authClient.resendEmailVerification(customerEmail);

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
