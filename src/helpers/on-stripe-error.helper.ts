import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

/**
 * Handle an error encountered from the Stripe API.
 * @param err Error to handle
 * @param defaultMessage Default error message
 * @param res Response object
 */
export function onStripeError(
  err: Stripe.errors.StripeError,
  defaultMessage: string,
  res: Response
): void {
  if (res.headersSent) {
    // Error already handled (e.g., by middleware timeout).
    return;
  }

  console.error(defaultMessage, err);
  res
    .status(err.statusCode ?? StatusCodes.BAD_GATEWAY)
    .send({ message: err.message });
  return;
}
