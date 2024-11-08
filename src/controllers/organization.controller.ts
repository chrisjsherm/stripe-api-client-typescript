import { User } from "@fusionauth/typescript-client";
import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  BotulinumToxinPattern,
  IBotulinumToxinPatternViewModel,
  botulinumToxinPatternViewModelJsonSchema,
} from "../data-models/entities/botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import {
  Organization,
  updateNameJsonSchema,
} from "../data-models/entities/organization.entity";
import {
  PhysicalLocation,
  createPhysicalLocationJsonSchema,
} from "../data-models/entities/physical-location.entity";
import { StreetAddressType } from "../data-models/enums/street-address-type.enum";
import { createOrganizationJsonSchema } from "../data-models/interfaces/organization-create.json-schema";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getUsersByOrganization$ } from "../helpers/get-auth-users-by-organization.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateRequestBodyValidator } from "../helpers/validate-request-body.middleware";
import { ConstantConfiguration } from "../services/constant-configuration.service";

export const organizationsRouter = Router();
/** Routes */
organizationsRouter.get("/me", hasAnyRole([]), getOrganization);
organizationsRouter.post(
  "/",
  hasAnyRole([]),
  generateRequestBodyValidator(createOrganizationJsonSchema),
  createOrganization
);
organizationsRouter.put(
  "/me/name",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(updateNameJsonSchema),
  updateName
);
organizationsRouter.put(
  "/me/mailing-address",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(createPhysicalLocationJsonSchema),
  updateMailingAddress
);

organizationsRouter.get(
  "/me/botulinum-toxin-patterns",
  hasAnyRole([]),
  getToxinPatterns
);
organizationsRouter.post(
  "/me/botulinum-toxin-patterns",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinPatternViewModelJsonSchema),
  upsertToxinPattern
);
organizationsRouter.delete(
  "/me/botulinum-toxin-patterns/:patternId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  deleteToxinPattern
);

organizationsRouter.get(
  "/me/clinicians",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getClinicians
);

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

/**
 * Update the organization's mailing address.
 * @param req HTTP request
 * @param res HTTP response
 */
async function updateMailingAddress(
  req: Request,
  res: Response
): Promise<void> {
  const location: Pick<PhysicalLocation, "name" | "physicalAddress"> = req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const repo = AppDataSource.getRepository(Organization);
    const org = await repo.findOneOrFail({
      where: {
        id: organizationId,
      },
    });
    org.mailRecipientName = location.name;
    org.mailingAddress = {
      ...location.physicalAddress,
      streetAddressType: StreetAddressType.Mailing,
    };
    await org.save();

    res.json({ data: location });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred updating the mailing address.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Update the organization name.
 * @param req HTTP request
 * @param res HTTP response
 */
async function updateName(req: Request, res: Response): Promise<void> {
  const newName = req.body.name;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const repo = AppDataSource.getRepository(Organization);
    const org = await repo.findOneOrFail({
      where: {
        id: organizationId,
      },
      relations: {
        physicalLocations: true,
      },
      select: {
        id: true,
        name: true,
        mailRecipientName: true,
        mailingAddress: {
          street1: true,
          street2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
        physicalLocations: {
          id: true,
          name: true,
          physicalAddress: {
            street1: true,
            street2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
      },
    });
    org.name = newName;
    await org.save();

    res.json({ data: org });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred updating the organization name.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Create an organization entity
 * @param req HTTP request
 * @param res HTTP response
 */
async function createOrganization(req: Request, res: Response): Promise<void> {
  const organization: Organization = req.body;

  try {
    const authToken = decodeFusionAuthAccessToken(req);

    const getUserResult = await authClient.retrieveUser(authToken.id);
    if (getUserResult.exception) {
      throw getUserResult.exception;
    } else if (getUserResult.response.user === undefined) {
      throw createError.NotFound(`Could not find user ${authToken.id}.`);
    }

    const authUser = getUserResult.response.user;
    const organizationId = authUser.data?.[
      ConstantConfiguration.fusionAuth_user_data_organizationId
    ] as string;

    if (
      authToken.organizationId !== undefined ||
      organizationId !== undefined
    ) {
      throw createError.BadRequest(
        "User is already associated with an organization."
      );
    }

    const organizationRepository = AppDataSource.getRepository(Organization);
    const createdOrganization = await organizationRepository
      .create(organization)
      .save();

    try {
      await authClient.patchUser(authToken.id, {
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

    // User who created the organization is its administrator.
    await authClient.createGroupMembers({
      members: {
        [config.auth.groupId_organizationAdministrators]: [
          {
            userId: authToken.id,
          },
        ],
      },
    });

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
 * Delete a toxin pattern associated with an organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function deleteToxinPattern(req: Request, res: Response): Promise<void> {
  const patternId = req.params.patternId;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const toxin = await AppDataSource.getRepository(
      BotulinumToxinPattern
    ).findOneOrFail({
      where: {
        organizationId,
        id: patternId,
      },
      relations: {
        toxinAssociations: true,
      },
    });
    await toxin.softRemove();

    res.json({ data: null });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred deleting the toxin pattern with ID ${patternId}.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get botulinum toxin patterns associated with the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getToxinPatterns(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const patterns = await AppDataSource.getRepository(
      BotulinumToxinPattern
    ).find({
      where: {
        organizationId,
      },
      relations: {
        toxinAssociations: true,
      },
      order: {
        name: "ASC",
      },
    });

    res.json({
      data: patterns.map((pattern) => ({
        id: pattern.id,
        name: pattern.name,
        locations: pattern.locations,
        referenceDoseByToxinId: pattern.toxinAssociations.reduce(
          (
            acc: { [id: string]: number },
            toxinAssociation: BotulinumToxin_JOIN_BotulinumToxinPattern
          ): { [id: string]: number } => {
            acc[toxinAssociation.toxinId] =
              toxinAssociation.referenceDoseInToxinUnits;
            return acc;
          },
          {}
        ),
      })),
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving the organization's botulinum toxin patterns.",
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
async function getOrganization(req: Request, res: Response): Promise<void> {
  try {
    const userInfo = decodeFusionAuthAccessToken(req);
    if (!userInfo.organizationId) {
      res.json({
        data: null,
      });
      return;
    }

    const organizationRepo = AppDataSource.getRepository(Organization);
    const organization = await organizationRepo.findOne({
      where: { id: userInfo.organizationId },
      relations: {
        physicalLocations: true,
      },
      select: {
        id: true,
        name: true,
        mailingAddress: {
          street1: true,
          street2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          streetAddressType: true,
        },
        mailRecipientName: true,
        physicalLocations: {
          id: true,
          name: true,
          physicalAddress: {
            street1: true,
            street2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            streetAddressType: true,
          },
        },
      },
    });

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
 * Upsert a toxin pattern and associate it with the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function upsertToxinPattern(req: Request, res: Response): Promise<void> {
  const patternViewModel = req.body as IBotulinumToxinPatternViewModel;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const toxinIds = Object.keys(patternViewModel.referenceDoseByToxinId);
    const toxins = await AppDataSource.getRepository(BotulinumToxin)
      .createQueryBuilder("toxin")
      .where("toxin.organizationId = :organizationId", { organizationId })
      .andWhere("toxin.id IN (:...toxinIds)", {
        toxinIds,
      })
      .getMany();
    if (toxins.length !== toxinIds.length) {
      throw createError.BadRequest(
        "Some of the toxin IDs associated with this pattern do not exist."
      );
    }

    let savedPatternId = "";
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const patternRepository = transactionalEntityManager.getRepository(
        BotulinumToxinPattern
      );

      // Use upsertFn to create or update the pattern
      const queryResult = await patternRepository.upsert(
        {
          id: patternViewModel.id,
          name: patternViewModel.name,
          locations: patternViewModel.locations,
          organizationId: organizationId,
        },
        {
          conflictPaths: ["id"],
          skipUpdateIfNoValuesChanged: true,
        }
      );

      // Get the pattern entity
      const savedPattern = await patternRepository.findOneOrFail({
        where: { id: queryResult.identifiers[0].id },
      });

      // Update the toxins relationship
      const relationRepo = transactionalEntityManager.getRepository(
        BotulinumToxin_JOIN_BotulinumToxinPattern
      );
      const toxinRelations = toxins.map((toxin) => {
        const relation = new BotulinumToxin_JOIN_BotulinumToxinPattern();
        relation.toxin = toxin;
        relation.pattern = savedPattern;
        relation.referenceDoseInToxinUnits =
          patternViewModel.referenceDoseByToxinId[toxin.id];
        return relation;
      });

      await relationRepo.save(toxinRelations);
      savedPatternId = savedPattern.id;
    });

    res.json({
      data: {
        ...patternViewModel,
        id: savedPatternId,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred saving the toxin pattern.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get clinicians associated with the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getClinicians(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const clinicians = await getUsersByOrganization$(
      organizationId,
      authClient
    );

    res.json({
      data: clinicians.map((clinician: User) => {
        return {
          id: clinician.id,
          firstName: clinician.firstName,
          lastName: clinician.lastName,
        };
      }),
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving clinicians.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
