import { User, UserRegistration } from "@fusionauth/typescript-client";
import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { MoreThan } from "typeorm";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { applyDefaultMemberships$ } from "../helpers/apply-default-group-memberships.helper";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { getUsersByOrganization$ } from "../helpers/get-auth-users-by-organization.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { getFusionAuth } from "../helpers/get-fusion-auth.helper";
import getStripe from "../helpers/get-stripe.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";
import { ConstantConfiguration } from "../services/constant-configuration.service";

/**
 * Endpoints related to the application user.
 */
export const usersRouter = Router();
usersRouter.delete(
  "/:userId",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  deleteUser
);
usersRouter.post(
  "/invite",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  invite
);
usersRouter.put(
  "/:userId/is-organization-administrator",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  modifyOrganizationAdministratorStatus
);
usersRouter.get("/me", getAuthenticatedUserProfile);
usersRouter.get(
  "/",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getUsers
);
usersRouter.post("/verify-email", resendEmailVerificationMessage);
usersRouter.post("/refresh-group-memberships", refreshGroupMemberships);

const config = getEnvironmentConfiguration();
const stripeClient = getStripe(config);
const authClient = getFusionAuth(config);

/**
 * Delete a user.
 * @param req HTTP request
 * @param res HTTP response
 */
async function deleteUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId;

  try {
    const { organizationId, id } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const user = (await authClient.retrieveUser(userId)).response.user;
    if (
      user?.data?.[
        ConstantConfiguration.fusionAuth_user_data_organizationId
      ] !== organizationId
    ) {
      throw createError.NotFound(
        `A user with ID ${userId} does not exist in your organization.`
      );
    }

    if (user.id === id) {
      throw createError.BadRequest("You cannot delete your own account.");
    }

    await authClient.deleteUser(userId);

    res.json({ data: undefined });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred deleting user ${userId}.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get the user profile for the user who initiated this request.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getAuthenticatedUserProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = decodeFusionAuthAccessToken(req);
    res.send({
      data: token,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "Error getting authenticated user's profile.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get users associated with the requesting user's organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const users = await getUsersByOrganization$(organizationId, authClient);
    res.json({
      data: users,
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred retrieving users.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Send an email invitation to join the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function invite(req: Request, res: Response): Promise<void> {
  const recipient = req.body as User;

  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "You cannot invite users because your account is not associated " +
          "with an organization."
      );
    }

    const emailMatchesQuery = await authClient.searchUsersByQuery({
      search: {
        query: JSON.stringify({
          match: {
            email: {
              query: recipient.email,
            },
          },
        }),
      },
    });
    if (emailMatchesQuery.response.total ?? 0 > 0) {
      throw createError.BadRequest(
        `Email address ${recipient.email} is not available.`
      );
    }

    const subscriptions = await AppDataSource.getRepository(
      ProductSubscription
    ).find({
      relations: {
        product: true,
      },
      where: {
        organization: {
          id: organizationId,
        },
      },
    });

    let maxUsers = 0;
    const groupIds = new Set<string>();
    for (const subscription of subscriptions) {
      maxUsers = Math.max(maxUsers, subscription.product.userCount ?? 0);
      subscription.product.groupMembershipsCsv
        .split(",")
        .forEach((id: string) => groupIds.add(id));
    }
    const users = await getUsersByOrganization$(organizationId, authClient);
    if (users.length >= maxUsers) {
      throw createError.BadRequest(
        `Your organization is using ${users.length} of ${maxUsers} user accounts.`
      );
    }

    const result = await authClient.createUser("", {
      applicationId: environment.auth.appId,
      sendSetPasswordEmail: true,
      user: {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        email: recipient.email,
        memberships: Array.from(groupIds).map((id) => {
          return {
            groupId: id,
          };
        }),
        data: {
          [ConstantConfiguration.fusionAuth_user_data_organizationId]:
            organizationId,
        },
      },
    });

    if (result.exception) {
      return onErrorProcessingHttpRequest(
        result.exception,
        result.exception.message,
        result.statusCode,
        res
      );
    }

    res.status(StatusCodes.CREATED).send({
      data: {
        user: {
          id: result.response.user?.id,
          email: result.response.user?.email,
          emailVerified: result.response.user?.verified,
          firstName: result.response.user?.firstName,
          lastName: result.response.user?.lastName,
          mobilePhone: result.response.user?.mobilePhone,
          organizationId:
            result.response.user?.data?.[
              ConstantConfiguration.fusionAuth_user_data_organizationId
            ],
          stripeCustomerId:
            result.response.user?.data?.[
              ConstantConfiguration.fusionAuth_user_data_stripeCustomerId
            ],
        },
      },
    });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred sending the invitation.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Adjust the administrator status of a user.
 * @param req HTTP request
 * @param res HTTP response
 */
async function modifyOrganizationAdministratorStatus(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.params.userId;

  try {
    const { organizationId, id } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const user = (await authClient.retrieveUser(userId)).response.user;
    if (
      user?.data?.[
        ConstantConfiguration.fusionAuth_user_data_organizationId
      ] !== organizationId
    ) {
      throw createError.NotFound(
        `A user with ID ${userId} does not exist in your organization.`
      );
    }

    if (user.id === id) {
      throw createError.BadRequest(
        "You cannot modify your own administrator status."
      );
    }

    const users = await getUsersByOrganization$(organizationId, authClient);
    const adminCount = users.reduce((acc: number, user: User): number => {
      const isAdmin = user.registrations
        ?.find((registration: UserRegistration): boolean => {
          return registration.applicationId === environment.auth.appId;
        })
        ?.roles?.includes(environment.auth.role_organizationAdministrator);

      if (isAdmin) {
        return acc + 1;
      }
      return acc;
    }, 0);

    if (req.body.isOrganizationAdministrator) {
      const subscriptionsRepo =
        AppDataSource.getRepository(ProductSubscription);
      const subscriptions = await subscriptionsRepo.find({
        where: {
          organizationId,
          expirationDateTime: MoreThan(DateTime.now().toJSDate()),
        },
        relations: { product: true },
      });
      const maxAdmins = subscriptions.reduce(
        (acc: number, subscription: ProductSubscription): number => {
          return Math.max(acc, subscription.product.adminCount ?? 0);
        },
        0
      );
      if (adminCount >= maxAdmins) {
        throw createError.BadRequest(
          `Your organization is using ${adminCount} of ${maxAdmins} admin roles.`
        );
      }

      await authClient.createGroupMembers({
        members: {
          [environment.auth.groupId_organizationAdministrators]: [
            {
              userId: userId,
            },
          ],
        },
      });
    } else {
      if (adminCount === 1) {
        throw createError.BadRequest(
          "You cannot remove the last administrator."
        );
      }

      await authClient.deleteGroupMembers({
        members: {
          [environment.auth.groupId_organizationAdministrators]: [userId],
        },
      });
    }

    res.json({ data: undefined });
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      `An error occurred updating user ${userId}.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Resend a message asking the customer to verify his email.
 * @param req HTTP request
 * @param res HTTP response
 */
async function resendEmailVerificationMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email: userEmail } = decodeFusionAuthAccessToken(req);
    const result = await authClient.resendEmailVerification(userEmail);

    if (result.exception) {
      return onErrorProcessingHttpRequest(
        result.exception,
        result.exception.message,
        result.statusCode,
        res
      );
    }

    res.status(StatusCodes.CREATED).send({
      data: {
        sentTimestampUtcMs: new Date().getTime(),
      },
    });
  } catch (e) {
    onErrorProcessingHttpRequest(
      e,
      "Error resending verification email.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Refresh the authenticated user's group memberships.
 * @param req HTTP request
 * @param res HTTP response
 */
async function refreshGroupMemberships(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = decodeFusionAuthAccessToken(req);
    await applyDefaultMemberships$(token, authClient);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    onErrorProcessingHttpRequest(
      error,
      `Error refreshing user's group memberships.`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
