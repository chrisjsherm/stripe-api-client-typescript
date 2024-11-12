import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getUsersByGroup$ } from "../helpers/get-auth-users-by-group.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

/**
 * Endpoints related to patients.
 */
export const patientsRouter = Router();
patientsRouter.get(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getPatients
);

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Get patients associated with the requesting user's organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getPatients(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const patients = await getUsersByGroup$(
      config.auth.groupId_patients,
      organizationId,
      authClient
    );
    res.json({
      data: patients,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred retrieving patients.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
