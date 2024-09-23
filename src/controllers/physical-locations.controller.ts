import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { PhysicalLocation } from "../data-models/entities/physical-location.entity";
import { AppDataSource } from "../db/data-source";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

export const physicalLocationsRouter = Router();
physicalLocationsRouter.get("/", hasAnyRole([]), getLocations);

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
      "Error assigning organization to user",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
