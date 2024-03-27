import { Request, Response } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { Organization } from "../data-models/entities/organization.entity";
import { User } from "../data-models/entities/user.entity";
import { AppDataSource } from "../db/data-source";
import { getUserInfo } from "../helpers/get-user-info.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

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
    const userInfo = getUserInfo(req);
    if (userInfo.id === undefined || userInfo.email === undefined) {
      throw createError.Unauthorized();
    }

    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({
      where: { fusionAuthId: userInfo.id },
    });
    if (user === null) {
      user = await userRepository.create({ fusionAuthId: userInfo.id }).save();
    }

    const organizationRepository = AppDataSource.getRepository(Organization);
    const createdOrganization = await organizationRepository
      .create({ ...organization, users: [user] })
      .save();

    res.status(StatusCodes.CREATED).json({
      data: {
        id: createdOrganization.id,
        name: createdOrganization.name,
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
    const userInfo = getUserInfo(req);
    if (userInfo.id === undefined || userInfo.email === undefined) {
      throw createError.Unauthorized();
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        fusionAuthId: userInfo.id,
      },
      relations: {
        organization: true,
      },
    });

    if (user === null) {
      throw createError.NotFound(
        "Could not find an organization associated with the authenticated user."
      );
    }

    res.json({
      data: user.organization,
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
