import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import {
  createPhysicalLocationJsonSchema,
  PhysicalLocation,
} from "../data-models/entities/physical-location.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { generateRequestBodyValidator } from "../helpers/validate-request-body.middleware";

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
physicalLocationsRouter.post(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  generateRequestBodyValidator(createPhysicalLocationJsonSchema),
  createLocation
);
physicalLocationsRouter.put(
  "/:locationId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  updateLocationById
);

/**
 * Create a new location for the authenticated user's organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function createLocation(req: Request, res: Response): Promise<void> {
  const location: Partial<PhysicalLocation> = req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    const createdLocation = await locationRepo.save({
      ...location,
      organizationId,
    });

    res.json({ data: createdLocation });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred creating the location.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

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
      select: { id: true },
    });
    if (location === null) {
      throw createError.NotFound(
        "The location you tried to delete does not exist."
      );
    }
    await location.softRemove();

    res.status(StatusCodes.OK).send();
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

/**
 * Update location by ID.
 * @param req HTTP request
 * @param res HTTP response
 */
async function updateLocationById(req: Request, res: Response): Promise<void> {
  const locationId = req.params.locationId;
  const modifiedLocation: Pick<PhysicalLocation, "name" | "physicalAddress"> =
    req.body;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your user account is not associated with an organization."
      );
    }

    const locationRepo = AppDataSource.getRepository(PhysicalLocation);
    const location = await locationRepo.findOneOrFail({
      where: {
        organizationId,
        id: locationId,
      },
    });
    location.name = modifiedLocation.name;
    location.physicalAddress = modifiedLocation.physicalAddress;
    await location.save();

    res.json({
      data: modifiedLocation,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred updating the location.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
