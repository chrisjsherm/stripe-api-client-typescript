import { User } from "@fusionauth/typescript-client";
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
import { searchAuthUsersByGroup$ } from "../helpers/search-auth-users-by-group.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Endpoints related to patients.
 */
export const patientRouter = Router();
patientRouter.get(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getPatients
);
patientRouter.post(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  createPatient
);
patientRouter.post(
  "/search",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  searchPatients
);

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Create a patient associated with the requesting user's organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function createPatient(req: Request, res: Response): Promise<void> {
  const patient = req.body as User;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "You cannot invite users because your account is not associated " +
          "with an organization."
      );
    }

    const emailMatchesQuery = await authClient.searchUsersByQuery({
      search: {
        query: JSON.stringify({
          match: {
            email: {
              query: patient.email,
            },
          },
        }),
      },
    });

    // Check if user with this email already exists.
    if (emailMatchesQuery.response.total ?? 0 > 0) {
      throw createError.BadRequest(
        `Email address ${patient.email} is not available.`
      );
    }

    const result = await authClient.createUser("", {
      applicationId: environment.auth.appId,
      sendSetPasswordEmail: true,
      user: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        mobilePhone: patient.mobilePhone,
        memberships: [
          {
            groupId: config.auth.groupId_patients,
          },
        ],
        data: {
          [ConstantConfiguration.fusionAuth_user_data_organizationId]:
            organizationId,
        },
      },
    });

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
        user: {
          id: result.response.user?.id,
          email: result.response.user?.email,
          emailVerified: result.response.user?.verified,
          firstName: result.response.user?.firstName,
          lastName: result.response.user?.lastName,
          mobilePhone: result.response.user?.mobilePhone,
          organizationId:
            result.response.user?.data?.[
              ConstantConfiguration.fusionAuth_user_data_organizationId
            ],
        },
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred adding the patient.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

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
      data: mapPublicPatientFields(patients),
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

/**
 * Fuzzy search for patients associated with the requesting user's organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function searchPatients(req: Request, res: Response): Promise<void> {
  const searchTerm: string = req.body.query;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const patients = await searchAuthUsersByGroup$(
      authClient,
      organizationId,
      config.auth.groupId_patients,
      searchTerm
    );

    res.json({
      data: mapPublicPatientFields(patients),
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred searching for patients.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Map an array of patients to an array of patients with only public fields for
 * sending to the client.
 * @param patients Patients to map
 * @returns Array of patients with only public fields
 */
function mapPublicPatientFields(patients: User[]): Partial<User[]> {
  return patients.map((user: User) => {
    return {
      active: user.active,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      memberships: user.memberships,
      mobilePhone: user.mobilePhone,
      verified: user.verified,
    };
  });
}
