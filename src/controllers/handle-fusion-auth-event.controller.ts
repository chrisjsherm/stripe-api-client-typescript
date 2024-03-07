import { EventRequest } from "@fusionauth/typescript-client";
import { Request, Response } from "express";

/**
 * Handle FusionAuth events via this webhook.
 * FusionAuth must be configured to use this endpoint via CLI or dashboard.
 * @param req HTTP request
 * @param res HTTP response
 * @param buf HTTP buffer
 */
export async function handleFusionAuthEvent(
  req: Request,
  res: Response
): Promise<void> {
  const { event } = JSON.parse(req.body.toString()) as EventRequest;
  console.log(`Received FusionAuth event: ${event?.type}`);
  console.dir(event);
  res.json({ message: "Success" });
}
