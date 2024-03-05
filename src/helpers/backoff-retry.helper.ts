import { Response } from "express";

/**
 * Attempt an asynchronous operation with exponential retry.
 * @param maxRetries Maximum number of retry attempts.
 * @param baseDelayMs Delay before initiating the first retry attempt, in milliseconds.
 * @param operation Operation to execute.
 * @returns Promise
 */
export function backoffRetry<T>(
  maxRetries: number,
  baseDelayMs: number,
  operation: () => Promise<T>,
  operationName: string,
  res: Response
): Promise<T> {
  let attemptCount = 0;

  async function attemptOperation(): Promise<T> {
    if (res.headersSent) {
      // Response already sent.
      return Promise.reject();
    }

    try {
      return await operation();
    } catch (error) {
      console.info(`${operationName} attempt ${attemptCount + 1} failed.`);

      if (attemptCount >= maxRetries) {
        throw error;
      }

      const delayMs = Math.pow(2, attemptCount) * baseDelayMs;

      console.info(
        `Initiating ${operationName} retry attempt ${
          attemptCount + 1
        } of ${maxRetries} in ${
          Math.round((delayMs / 1000) * 10) / 10
        } seconds.`
      );

      await delay(delayMs);

      ++attemptCount;

      return attemptOperation();
    }
  }

  return attemptOperation();
}

/**
 * Asynchronously delay execution of the current task.
 * @param milliseconds Milliseconds by which to asynchronously delay.
 * @returns Resolved promise after the delay.
 */
function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
}
