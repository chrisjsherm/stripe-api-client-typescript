import { User } from "@fusionauth/typescript-client";
import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import {
  BotulinumToxinPattern,
  IBotulinumToxinPatternViewModel,
  botulinumToxinPatternViewModelJsonSchema,
} from "../data-models/entities/botulinum-toxin-pattern.entity";
import {
  BotulinumToxinTreatment,
  IBotulinumToxinTreatmentViewModelCreate,
  IBotulinumToxinTreatmentViewModelRead,
} from "../data-models/entities/botulinum-toxin-treatment.entity";
import {
  BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
  IBotulinumToxinTreatmentPatternViewModelRead,
} from "../data-models/entities/botulinum-toxin-treatment_JOIN_botulinum-toxin-pattern.entity";
import {
  BotulinumToxin,
  IBotulinumToxin,
  botulinumToxinJsonSchema,
} from "../data-models/entities/botulinum-toxin.entity";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { createOrganizationJsonSchema } from "../data-models/interfaces/organization-create.json-schema";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getUsersByOrganization$ } from "../helpers/get-auth-users-by-organization.helper";
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
organizationsRouter.delete(
  "/me/botulinum-toxin-patterns/:patternId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  deleteToxinPattern
);
organizationsRouter.post(
  "/me/botulinum-toxin-treatments",
  hasAnyRole([]),
  createToxinTreatment
);
organizationsRouter.get(
  "/me/botulinum-toxin-treatments",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getToxinTreatments
);

organizationsRouter.get(
  "/me/clinicians",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getClinicians
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

    const toxin = await AppDataSource.getRepository(
      BotulinumToxin
    ).findOneOrFail({
      where: {
        organizationId,
        id: toxinId,
      },
      relations: {
        patternAssociations: true,
      },
    });
    await toxin.softRemove();

    res.json({ data: null });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred deleting the toxin with ID ${toxinId}.`,
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
      .select([
        "toxin.id",
        "toxin.name",
        "toxin.vialSizeInUnits",
        "toxin.pricePerUnitInBaseCurrencyUnits",
      ])
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

/**
 * Create a botulinum toxin treatment entry in the database.
 * @param req HTTP request
 * @param res HTTP response
 */
async function createToxinTreatment(
  req: Request,
  res: Response
): Promise<void> {
  const treatment: IBotulinumToxinTreatmentViewModelCreate = req.body;

  try {
    const { organizationId, id: userId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const treatmentRepo = AppDataSource.getRepository(BotulinumToxinTreatment);
    const savedTreatment = await treatmentRepo
      .create({
        clinicianId: userId,
        organizationId,
      })
      .save();
    const relationRepo = AppDataSource.getRepository(
      BotulinumToxinTreatment_JOIN_BotulinumToxinPattern
    );
    const patternRelations = treatment.treatmentPatterns.map((pattern) => {
      return relationRepo.create({
        ...pattern,
        treatmentId: savedTreatment.id,
      });
    });
    await relationRepo.save(patternRelations);

    res.json({
      data: {
        id: savedTreatment.id,
        clinicianId: savedTreatment.clinicianId,
        createdDateTime: savedTreatment.createdDateTime,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred saving the treatment.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get botulinum toxin treatments, optionally filtered
 * @param req HTTP request
 * @param res HTTP response
 */
async function getToxinTreatments(req: Request, res: Response): Promise<void> {
  const clinicianIdFilter =
    req.query[ConstantConfiguration.queryParam_clinicianId];
  const dateFromFilter = req.query[ConstantConfiguration.queryParam_dateFrom];
  const dateToFilter = req.query[ConstantConfiguration.queryParam_dateTo];
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const treatmentRepo = AppDataSource.getRepository(BotulinumToxinTreatment);
    const whereClause: FindOptionsWhere<BotulinumToxinTreatment> = {
      organizationId,
    };
    if (typeof clinicianIdFilter === "string") {
      whereClause.clinicianId = clinicianIdFilter;
    }
    if (
      typeof dateFromFilter === "string" ||
      typeof dateToFilter === "string"
    ) {
      if (
        typeof dateFromFilter === "string" &&
        typeof dateToFilter === "string"
      ) {
        whereClause.createdDateTime = Between(
          new Date(dateFromFilter),
          new Date(dateToFilter)
        );
      } else if (typeof dateFromFilter === "string") {
        whereClause.createdDateTime = MoreThanOrEqual(new Date(dateFromFilter));
      } else if (typeof dateToFilter === "string") {
        whereClause.createdDateTime = LessThanOrEqual(new Date(dateToFilter));
      }
    }
    const treatments = await treatmentRepo.find({
      where: whereClause,
      relations: {
        patterns: true,
      },
      order: {
        createdDateTime: "DESC",
      },
    });

    const patternsRepo = AppDataSource.getRepository(BotulinumToxinPattern);
    const patterns = await patternsRepo.find({
      where: {
        organizationId,
      },
    });
    const patternById = new Map<string, BotulinumToxinPattern>();
    for (const pattern of patterns) {
      patternById.set(pattern.id, pattern);
    }

    const toxinsRepo = AppDataSource.getRepository(BotulinumToxin);
    const toxins = await toxinsRepo.find({
      where: {
        organizationId,
      },
    });
    const toxinById = new Map<string, BotulinumToxin>();
    for (const toxin of toxins) {
      toxinById.set(toxin.id, toxin);
    }

    const users = await getUsersByOrganization$(organizationId, authClient);
    const userNameById = new Map<
      string,
      { firstName: string; lastName: string }
    >();
    for (const user of users) {
      userNameById.set(user.id!, {
        firstName: user.firstName!,
        lastName: user.lastName!,
      });
    }

    const results: IBotulinumToxinTreatmentViewModelRead[] = [];
    for (const treatment of treatments) {
      let totalPrice = 0;
      const treatmentPatterns = treatment.patterns.map(
        (
          patternAssociation: BotulinumToxinTreatment_JOIN_BotulinumToxinPattern
        ): IBotulinumToxinTreatmentPatternViewModelRead => {
          const product = toxinById.get(patternAssociation.productId);
          if (!product) {
            throw createError.Conflict(
              `The treatment with ID ${treatment.id} references a product with ID ${patternAssociation.productId} that does not exist.`
            );
          }
          const pattern = patternById.get(patternAssociation.patternId);
          if (!pattern) {
            throw createError.Conflict(
              `The treatment with ID ${treatment.id} references a pattern with ID ${patternAssociation.patternId} that does not exist.`
            );
          }

          totalPrice +=
            patternAssociation.priceChargedPerToxinUnitInBaseCurrencyUnits *
            patternAssociation.toxinUnits;
          return {
            diluentMl: patternAssociation.diluentMl,
            priceChargedPerToxinUnitInBaseCurrencyUnits:
              patternAssociation.priceChargedPerToxinUnitInBaseCurrencyUnits,
            product: { id: product.id, name: product.name },
            pattern: { id: pattern.id, name: pattern.name },
            toxinUnits: patternAssociation.toxinUnits,
          };
        }
      );

      results.push({
        id: treatment.id,
        createdDateTime: treatment.createdDateTime.toISOString(),
        clinician: {
          id: treatment.clinicianId,
          firstName: userNameById.get(treatment.clinicianId)?.firstName,
          lastName: userNameById.get(treatment.clinicianId)?.lastName,
        },
        treatmentPatterns,
        totalPriceChargedInBaseCurrencyUnits: totalPrice,
      });
    }

    res.json({
      data: results,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving treatments.",
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
