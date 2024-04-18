import { Request, Response } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { Organization } from "../data-models/entities/organization.entity";
import { AppDataSource } from "../db/data-source";
import { getAppUser } from "../helpers/get-app-user.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Create an organization entity
 * @param req HTTP request
 * @param res HTTP response
 */
export async function createOrganization(
  req: Request,
  res: Response
): Promise<void> {
  const organization: Organization = req.body;

  try {
    const userInfo = getAppUser(req);
    const authUser = await getAuthUserById$(userInfo.id, authClient);
    const organizationId = authUser.data?.[
      ConstantConfiguration.fusionAuth_user_data_organizationId
    ] as string;
    if (userInfo.organizationId !== undefined || organizationId !== undefined) {
      throw createError.BadRequest(
        "User is already associated with an organization."
      );
    }

    const organizationRepository = AppDataSource.getRepository(Organization);
    const createdOrganization = await organizationRepository
      .create(organization)
      .save();

    try {
      await authClient.patchUser(userInfo.id, {
        user: {
          data: {
            [ConstantConfiguration.fusionAuth_user_data_organizationId]:
              createdOrganization.id,
          },
        },
      });
    } catch (err) {
      createdOrganization.softRemove();
      throw err;
    }

    res.status(StatusCodes.CREATED).json({
      data: {
        id: createdOrganization.id,
        name: createdOrganization.name,
        mailingAddress: createdOrganization.mailingAddress,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "❗️ Error assigning organization to user",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get the organization associated with the authenticated user.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function getUserOrganization(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userInfo = getAppUser(req);
    if (userInfo.organizationId === undefined) {
      throw createError.BadRequest(
        "User is not associated with an organization."
      );
    }

    const organizationRepo = AppDataSource.getRepository(Organization);
    const organization = await organizationRepo.findOne({
      where: { id: userInfo.organizationId },
    });

    if (organization === null) {
      throw createError.NotFound(
        `Organization with id "${userInfo.organizationId}" was not found.`
      );
    }

    res.json({
      data: organization,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "❗️ Error finding authenticated user's organization.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
