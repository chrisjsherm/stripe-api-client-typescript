import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

/**
 * Handle an error when calling the Stripe API.
 * @param err Error to handle
 * @param defaultMessage Default error message
 * @param res Response object
 */
export function handleStripeApiError(
  err: any,
  defaultMessage: string,
  res: Response
): void {
  if (res.headersSent) {
    // Error already handled (e.g., by middleware timeout).
    return;
  }

  console.error(defaultMessage, err);
  if (err instanceof Stripe.errors.StripeError) {
    res
      .status(err.statusCode ?? StatusCodes.BAD_GATEWAY)
      .send({ message: err.message });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    message: defaultMessage,
  });
}
