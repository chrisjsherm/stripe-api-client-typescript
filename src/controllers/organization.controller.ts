import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { Organization } from "../data-models/entities/organization.entity";
import { createOrganizationJsonSchema } from "../data-models/interfaces/organization-create.json-schema";
import { btxPatternConfigurationJsonSchema } from "../data-models/types/btx-pattern-configuration.type";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateRequestBodyValidator } from "../helpers/validate-request-body.middleware";
import { ConstantConfiguration } from "../services/constant-configuration.service";

export const organizationsRouter = Router();
organizationsRouter.post(
  "/",
  hasAnyRole([]),
  generateRequestBodyValidator(createOrganizationJsonSchema),
  createOrganization
);
organizationsRouter.get("/me", hasAnyRole([]), getUserOrganization);
organizationsRouter.put(
  "/me/btx-pattern-configuration",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(btxPatternConfigurationJsonSchema),
  updateBtxPatternConfiguration
);

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Create an organization entity
 * @param req HTTP request
 * @param res HTTP response
 */
async function createOrganization(req: Request, res: Response): Promise<void> {
  const organization: Organization = req.body;

  try {
    const userInfo = decodeFusionAuthAccessToken(req);
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
      await createdOrganization.softRemove();
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
      "Error assigning organization to user",
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
async function getUserOrganization(req: Request, res: Response): Promise<void> {
  try {
    const userInfo = decodeFusionAuthAccessToken(req);
    if (userInfo.organizationId === undefined) {
      res.json({
        data: null,
      });
      return;
    }

    const organizationRepo = AppDataSource.getRepository(Organization);
    const organization = await organizationRepo
      .createQueryBuilder("organization")
      .where("organization.id = :id", { id: userInfo.organizationId })
      .getOne();

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
      "Error finding authenticated user's organization.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Modify an organization's botulinum toxin pattern configuration.
 * @param req HTTP request
 * @param res HTTP response
 */
async function updateBtxPatternConfiguration(
  req: Request,
  res: Response
): Promise<void> {
  const configuration = req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const organizationRepo = AppDataSource.getRepository(Organization);
    const organization = await organizationRepo.findOne({
      where: { id: organizationId },
    });
    if (!organization) {
      throw createError.BadRequest(
        "The organization associated with your account no longer exists."
      );
    }
    organization.btxPatternConfiguration = configuration;
    await organization.save();
    res.json({ data: null });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error updating the organization's botulinum toxin pattern configuration.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
