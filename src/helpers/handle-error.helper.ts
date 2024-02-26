import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { handleStripeApiError } from "./handle-stripe-error.helper";

export function handleError(
  err: any,
  message: string,
  statusCode: StatusCodes,
  res: Response
): void {
  if (res.headersSent) {
    // Error already handled (e.g., by middleware timeout).
    return;
  }

  if (err instanceof Stripe.errors.StripeError) {
    return handleStripeApiError(err, message, res);
  }

  console.error(message, err);
  res.status(statusCode).send({
    message,
  });
}
