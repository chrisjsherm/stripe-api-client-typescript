import { Request, Response, Router } from "express";
import * as createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { DateTime } from "luxon";
import { MoreThan } from "typeorm";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { AppDataSource } from "../db/data-source";
import { environment } from "../environment/environment";
import { decodeFusionAuthAccessToken } from "../helpers/decode-fusion-auth-access-token.helper";
import { hasAnyRole } from "../helpers/has-any-role.helper";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

export const productSubscriptionsRouter = Router();
productSubscriptionsRouter.get(
  "",
  hasAnyRole([environment.auth.role_organizationAdministrator]),
  getActiveSubscriptions
);

/**
 * Get unexpired subscriptions for the organization.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getActiveSubscriptions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { organizationId } = decodeFusionAuthAccessToken(req);
    if (!organizationId) {
      throw createError.BadRequest(
        "Your account is not associated with an organization."
      );
    }

    const subscriptionsRepo = AppDataSource.getRepository(ProductSubscription);
    const subscriptions = await subscriptionsRepo.find({
      where: {
        organizationId,
        expirationDateTime: MoreThan(DateTime.now().toJSDate()),
      },
      relations: { product: true },
    });

    if (!res.headersSent) {
      res.send({
        data: subscriptions.map((subscription: ProductSubscription) => {
          return {
            expirationDateTime: subscription.expirationDateTime,
            product: {
              id: subscription.product.id,
              title: subscription.product.title,
              subtitle: subscription.product.subtitle,
              priceInBaseUnits: subscription.product.priceInBaseUnits,
              currencyCode: subscription.product.currencyCode,
              statementDescriptorSuffix:
                subscription.product.statementDescriptorSuffix,
              adminCount: subscription.product.adminCount,
              userCount: subscription.product.userCount,
              storageGb: subscription.product.storageGb,
            },
          };
        }),
      });
    }
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving product subscriptions.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
