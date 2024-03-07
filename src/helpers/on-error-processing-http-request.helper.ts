import { Response } from "express";
import { HttpError } from "http-errors";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { onStripeError } from "./on-stripe-error.helper";

/**
 * Handle an error in a consistent way while processing an HTTP request.
 * @param err Error encountered, usually a thrown object
 * @param defaultMessage Message to use if the err parameter does not have a
 * public message
 * @param defaultStatusCode Status code to use if the err parameter does set a status
 * @param res HTTP response object
 */
export function onErrorProcessingHttpRequest(
  err: any,
  defaultMessage: string,
  defaultStatusCode: StatusCodes,
  res: Response
): void {
  console.error(defaultMessage);
  console.dir(err);

  if (res.headersSent) {
    // Error already handled (e.g., by middleware timeout).
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).send({
      message: err.expose ? err.message : defaultMessage,
    });
    return;
  }

  if (err instanceof Stripe.errors.StripeError) {
    return onStripeError(err, defaultMessage, res);
  }

  res.status(defaultStatusCode).send({
    message: defaultMessage,
  });
}
