import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

const config = getEnvironmentConfiguration();

/**
 * Handle a user logging out of the UI.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function handleLogout(req: Request, res: Response): Promise<void> {
  // Avoid HTTP 431 Request Header Fields Too Large by clearing known devices.
  for (const [key] of Object.entries(req.cookies)) {
    if (
      key.startsWith(ConstantConfiguration.fusionAuth_cookiePrefix_knownDevice)
    ) {
      res.clearCookie(key);
    }
  }

  res.redirect(StatusCodes.SEE_OTHER, config.uiOrigin);
}
