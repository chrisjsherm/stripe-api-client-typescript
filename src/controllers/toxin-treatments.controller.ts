import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import { BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin-pattern.entity";
import {
  BotulinumToxinTreatment,
  IBotulinumToxinTreatmentViewModelCreate,
  IBotulinumToxinTreatmentViewModelRead,
} from "../data-models/entities/botulinum-toxin-treatment.entity";
import {
  BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
  IBotulinumToxinTreatmentPatternViewModelRead,
} from "../data-models/entities/botulinum-toxin-treatment_JOIN_botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { PhysicalLocation } from "../data-models/entities/physical-location.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getAuthUserById$ } from "../helpers/get-auth-user-by-id.helper";
import { getUsersByOrganization$ } from "../helpers/get-auth-users-by-organization.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateQueryParamValidator } from "../helpers/validate-query-params.middleware";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { getToxinTreatmentsQueryParamsJsonSchema } from "./ajv/get-toxin-treatments-query-params.schema";

export const toxinTreatmentsRouter = Router();

toxinTreatmentsRouter.post("/", hasAnyRole([]), createToxinTreatment);
toxinTreatmentsRouter.get(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateQueryParamValidator(getToxinTreatmentsQueryParamsJsonSchema),
  getToxinTreatments
);
toxinTreatmentsRouter.get(
  "/:treatmentId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getToxinTreatmentById
);

const config = getEnvironmentConfiguration();
const authClient = getFusionAuth(config);

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

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    await locationRepo.findOneOrFail({
      where: {
        organizationId,
        id: treatment.physicalLocationId,
      },
    });

    const treatmentRepo = AppDataSource.getRepository(BotulinumToxinTreatment);
    const savedTreatment = await treatmentRepo
      .create({
        clinicianId: userId,
        physicalLocationId: treatment.physicalLocationId,
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
 * Get botulinum toxin treatments, optionally filtered.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getToxinTreatments(req: Request, res: Response): Promise<void> {
  const clinicianIdFilter =
    req.query[ConstantConfiguration.queryParam_clinicianId];
  const dateStartFilter = req.query[ConstantConfiguration.queryParam_dateStart];
  const dateEndFilter = req.query[ConstantConfiguration.queryParam_dateEnd];
  const locationIdFilter =
    req.query[ConstantConfiguration.queryParam_locationId];

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const treatmentRepo = AppDataSource.getRepository(BotulinumToxinTreatment);
    const whereClause: FindOptionsWhere<BotulinumToxinTreatment> = {
      physicalLocation: {
        organizationId,
      },
    };
    if (typeof clinicianIdFilter === "string") {
      whereClause.clinicianId = clinicianIdFilter;
    }
    if (
      typeof dateStartFilter === "string" ||
      typeof dateEndFilter === "string"
    ) {
      if (
        typeof dateStartFilter === "string" &&
        typeof dateEndFilter === "string"
      ) {
        whereClause.createdDateTime = Between(
          new Date(dateStartFilter),
          new Date(dateEndFilter)
        );
      } else if (typeof dateStartFilter === "string") {
        whereClause.createdDateTime = MoreThanOrEqual(
          new Date(dateStartFilter)
        );
      } else if (typeof dateEndFilter === "string") {
        whereClause.createdDateTime = LessThanOrEqual(new Date(dateEndFilter));
      }
    }
    if (typeof locationIdFilter === "string") {
      whereClause.physicalLocationId = locationIdFilter;
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
            id: pattern.id,
            diluentMl: patternAssociation.diluentMl,
            name: pattern.name,
            priceChargedPerToxinUnitInBaseCurrencyUnits:
              patternAssociation.priceChargedPerToxinUnitInBaseCurrencyUnits,
            product: { id: product.id, name: product.name },
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
 * Get botulinum toxin treatment by ID.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getToxinTreatmentById(
  req: Request,
  res: Response
): Promise<void> {
  const treatmentId = req.params.treatmentId;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const treatmentRepo = AppDataSource.getRepository(BotulinumToxinTreatment);
    const treatment = await treatmentRepo.findOneOrFail({
      where: {
        id: treatmentId,
        physicalLocation: {
          organizationId,
        },
      },
      relations: {
        patterns: true,
        physicalLocation: true,
      },
      select: {
        id: true,
        createdDateTime: true,
        clinicianId: true,
        physicalLocation: {
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
          id: pattern.id,
          diluentMl: patternAssociation.diluentMl,
          priceChargedPerToxinUnitInBaseCurrencyUnits:
            patternAssociation.priceChargedPerToxinUnitInBaseCurrencyUnits,
          product: { id: product.id, name: product.name },
          name: pattern.name,
          toxinUnits: patternAssociation.toxinUnits,
        };
      }
    );

    const clinician = await getAuthUserById$(
      treatment.clinicianId,
      organizationId,
      authClient
    );

    res.json({
      data: {
        id: treatment.id,
        createdDateTime: treatment.createdDateTime.toISOString(),
        clinician: {
          id: treatment.clinicianId,
          firstName: clinician.firstName,
          lastName: clinician.lastName,
        },
        currencyCode: ConstantConfiguration.currencyCodeDefault,
        physicalLocation: treatment.physicalLocation,
        treatmentPatterns,
        totalPriceChargedInBaseCurrencyUnits: totalPrice,
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving the treatment.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
