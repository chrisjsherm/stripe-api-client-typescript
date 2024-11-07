import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  BotulinumToxin,
  botulinumToxinJsonSchema,
  IBotulinumToxin,
} from "../data-models/entities/botulinum-toxin.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateRequestBodyValidator } from "../helpers/validate-request-body.middleware";

export const toxinsRouter = Router();
/** Routes */
toxinsRouter.get("/", hasAnyRole([]), getToxins);
toxinsRouter.post(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinJsonSchema),
  createToxin
);
toxinsRouter.put(
  "/:toxinId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(botulinumToxinJsonSchema),
  updateToxin
);
toxinsRouter.delete(
  "/:toxinId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  deleteToxin
);

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
