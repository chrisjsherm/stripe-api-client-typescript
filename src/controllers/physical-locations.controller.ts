import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { PhysicalLocation } from "../data-models/entities/physical-location.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

export const physicalLocationsRouter = Router();
physicalLocationsRouter.delete(
  "/:locationId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  deleteLocationById
);
physicalLocationsRouter.get("/", hasAnyRole([]), getLocations);
physicalLocationsRouter.get(
  "/:locationId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getLocationById
);

/**
 * Delete location by ID.
 * @param req HTTP request
 * @param res HTTP response
 */
async function deleteLocationById(req: Request, res: Response): Promise<void> {
  const locationId = req.params.locationId;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    const locationCount = await locationRepo.countBy({ organizationId });
    if (locationCount < 2) {
      throw createError.BadRequest("You cannot delete the last location.");
    }

    const location = await locationRepo.findOne({
      where: {
        organizationId,
        id: locationId,
      },
      select: {
        id: true,
      },
    });
    if (location === null) {
      throw createError.NotFound(
        "The location you tried to delete does not exist."
      );
    }
    await location.softRemove();

    res.status(StatusCodes.OK);
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred deleting the location.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get location by ID.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getLocationById(req: Request, res: Response): Promise<void> {
  const locationId = req.params.locationId;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    const location = await locationRepo.findOne({
      where: {
        organizationId,
        id: locationId,
      },
      select: {
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
    });

    res.json({
      data: location,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving the location.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get locations for the authenticated user.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getLocations(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    const locations = await locationRepo.find({
      where: {
        organizationId,
      },
      select: {
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
    });

    res.json({
      data: locations,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving locations.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
