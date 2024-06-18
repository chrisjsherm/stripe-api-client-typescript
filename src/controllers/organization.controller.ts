import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  BotulinumToxinPattern,
  IBotulinumToxinPatternViewModel,
  botulinumToxinPatternViewModelJsonSchema,
} from "../data-models/entities/botulinum-toxin-pattern.entity";
import {
  BotulinumToxin,
  IBotulinumToxin,
  botulinumToxinJsonSchema,
} from "../data-models/entities/botulinum-toxin.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { createOrganizationJsonSchema } from "../data-models/interfaces/organization-create.json-schema";
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
/** Routes */
organizationsRouter.post(
  "/",
  hasAnyRole([]),
  generateRequestBodyValidator(createOrganizationJsonSchema),
  createOrganization
);

organizationsRouter.get("/me", hasAnyRole([]), getUserOrganization);

organizationsRouter.get("/me/botulinum-toxins", hasAnyRole([]), getToxins);
organizationsRouter.post(
  "/me/botulinum-toxins",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinJsonSchema),
  createToxin
);
organizationsRouter.put(
  "/me/botulinum-toxins/:toxinId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinJsonSchema),
  updateToxin
);
organizationsRouter.delete(
  "/me/botulinum-toxins/:toxinId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinJsonSchema),
  deleteToxin
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
 * Create a botulinum toxin.
 * @param req HTTP request
 * @param res HTTP response
 */
async function createToxin(req: Request, res: Response): Promise<void> {
  const toxin = req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const insertResult = await AppDataSource.createQueryBuilder()
      .insert()
      .into(BotulinumToxin)
      .values({
        ...toxin,
        organizationId,
      })
      .execute();

    const createdToxin = await AppDataSource.getRepository(BotulinumToxin)
      .createQueryBuilder("toxin")
      .where("toxin.id = :id", { id: insertResult.identifiers[0].id })
      .getOne();

    res.json({ data: createdToxin });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error updating the organization's botulinum toxin pattern configuration.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Delete a toxin associated with an organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function deleteToxin(req: Request, res: Response): Promise<void> {
  const toxinId = req.params.toxinId;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const toxin = await AppDataSource.getRepository(BotulinumToxin)
      .createQueryBuilder("toxin")
      .where("toxin.id = :toxinId", { toxinId })
      .andWhere("toxin.organizationId = :organizationId", { organizationId })
      .getOneOrFail();
    await toxin.softRemove();

    res.json({ data: null });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred deleting toxin with ID ${toxinId}.`,
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

    const patterns = await AppDataSource.getRepository(BotulinumToxinPattern)
      .createQueryBuilder("pattern")
      .leftJoinAndSelect("pattern.toxins", "toxin")
      .select(["pattern.id", "pattern.name", "pattern.locations", "toxin.id"])
      .where("pattern.organizationId = :organizationId", { organizationId })
      .orderBy("pattern.name")
      .getMany();

    res.json({
      data: patterns.map((pattern) => ({
        id: pattern.id,
        name: pattern.name,
        locations: pattern.locations,
        toxinIds: pattern.toxins.map((toxin) => toxin.id),
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
 * Get botulinum toxins associated with the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getToxins(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const toxins = await AppDataSource.getRepository(BotulinumToxin)
      .createQueryBuilder("toxin")
      .select()
      .where("toxin.organizationId = :organizationId", { organizationId })
      .orderBy("toxin.name")
      .getMany();

    res.json({ data: toxins });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving the organization's botulinum toxins.",
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
 * Upsert a toxin pattern and associate it with the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function upsertToxinPattern(req: Request, res: Response): Promise<void> {
  const pattern = req.body as IBotulinumToxinPatternViewModel;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const count = await AppDataSource.getRepository(BotulinumToxin)
      .createQueryBuilder("toxin")
      .where("toxin.organizationId = :organizationId", { organizationId })
      .andWhere("toxin.id IN (:...toxinIds", { toxinIds: pattern.toxinIds })
      .getCount();
    if (count !== pattern.toxinIds.length) {
      throw createError.BadRequest("Some of the toxin IDs do not exist.");
    }

    const repo = await AppDataSource.getRepository(BotulinumToxinPattern);
    const queryResult = await repo.upsert(
      {
        ...pattern,
        organizationId,
      },
      {
        conflictPaths: ["id"],
        skipUpdateIfNoValuesChanged: true,
      }
    );
    const patternId = queryResult.identifiers[0];
    const savedPattern = await repo
      .createQueryBuilder("pattern")
      .leftJoinAndSelect("pattern.toxins", "toxin")
      .select(["pattern.id", "pattern.name", "pattern.locations", "toxin.id"])
      .where("pattern pattern.id = :patternId", { patternId })
      .getOneOrFail();

    res.json({
      data: {
        id: savedPattern.id,
        name: savedPattern.name,
        locations: savedPattern.locations,
        toxinIds: savedPattern.toxins.map((toxin) => toxin.id),
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error updating the organization's botulinum toxin pattern configuration.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Modify a toxin associated with an organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function updateToxin(req: Request, res: Response): Promise<void> {
  const toxinId = req.params.toxinId;
  const modifiedToxin: IBotulinumToxin = req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const repo = await AppDataSource.getRepository(BotulinumToxin);
    await repo.update(
      { id: toxinId, organizationId },
      {
        name: modifiedToxin.name,
        vialSizeInUnits: modifiedToxin.vialSizeInUnits,
        pricePerUnitInBaseCurrencyUnits:
          modifiedToxin.pricePerUnitInBaseCurrencyUnits,
      }
    );

    res.json({ data: modifiedToxin });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred deleting toxin with ID ${toxinId}.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
