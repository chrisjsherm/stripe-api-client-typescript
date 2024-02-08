import { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

/**
 * ExpressJS middleware for consistently handling request timeout.
 * @param timeoutMs Number of milliseconds at which a request times out.
 * @returns Fn waits the specified number of milliseconds, after which it returns
 * a timeout response.
 */
export function timeoutMiddleware(timeoutMs: number) {
  return function (_req: Request, res: Response, next: NextFunction) {
    setTimeout(() => {
      if (!res.headersSent) {
        const timeoutStatus = StatusCodes.REQUEST_TIMEOUT;
        // If the response hasn't been sent yet, consider it timed out
        const err = new Error(getReasonPhrase(timeoutStatus));
        (err as any).status = timeoutStatus;
        next(err);
      }
    }, timeoutMs);

    next();
  };
}
