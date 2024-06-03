import FusionAuthClient, {
  GroupMember,
  MemberResponse,
} from "@fusionauth/typescript-client";
import ClientResponse from "@fusionauth/typescript-client/build/src/ClientResponse";
import * as createError from "http-errors";
import { DateTime } from "luxon";
import { Stripe } from "stripe";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { Product } from "../data-models/entities/product.entity";
import { PaymentProcessor } from "../data-models/enums/payment-processor.enum";
import { AppDataSource } from "../db/data-source";
import { IBuildConfiguration } from "../environment/data-models/build-configuration.interface";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { backoffRetry } from "./backoff-retry.helper";

/**
 * Handle a PaymentIntent success event.
 * @param paymentIntent Payment intent from which the successful charge originated
 * @param authClient FusionAuth client
 * @param buildConfig Build configuration
 */
export async function onPaymentIntentSucceededEvent$(
  paymentIntent: Stripe.PaymentIntent,
  authClient: FusionAuthClient,
  buildConfig: IBuildConfiguration
): Promise<void> {
  const customerId = paymentIntent.customer;
  if (typeof customerId !== "string") {
    throw createError.BadRequest(
      `The payment intent with ID ${paymentIntent.id} does not have a ` +
        "customer associated with it."
    );
  }

  const userId =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_userId
    ];
  if (typeof userId !== "string") {
    throw createError.BadRequest(
      `The payment intent with ID ${paymentIntent.id} does not have a` +
        "user associated with it."
    );
  }

  const organizationId =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_organizationId
    ];
  if (typeof organizationId !== "string") {
    throw createError.BadRequest(
      `The payment intent with ID ${paymentIntent.id} does not have an ` +
        "organization associated with it."
    );
  }

  const productIds =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_productIdsCsv
    ].split(",");
  if (productIds.length === 0) {
    throw createError.BadRequest(
      `The payment intent with ID ${paymentIntent.id} does not have any ` +
        "products associated with it."
    );
  }

  const productRepository = AppDataSource.getRepository(Product);
  const products = await productRepository
    .createQueryBuilder("product")
    .where("product.id IN (:...ids)", { ids: productIds })
    .getMany();

  let groupIds = new Array<string>();
  const subscriptionRepository =
    AppDataSource.getRepository(ProductSubscription);
  for (const product of products) {
    await subscriptionRepository.save({
      expirationDateTime: DateTime.now().plus({ year: 1 }).toString(),
      paymentId: paymentIntent.id,
      paymentProcessor: PaymentProcessor.Stripe,
      organization: {
        id: organizationId,
      },
      product,
    });

    if (product.groupMembershipsCsv) {
      groupIds.push(...product.groupMembershipsCsv.split(","));
    }
  }

  if (groupIds.length !== 0) {
    const groupAssignments = groupIds.reduce(
      (accumulated: Record<string, GroupMember[]>, groupId: string) => {
        accumulated[groupId] = [{ userId }];
        return accumulated;
      },
      {}
    );

    await backoffRetry<ClientResponse<MemberResponse>>(
      3,
      buildConfig.http.retryDelayMs,
      () => {
        return authClient.createGroupMembers({
          members: groupAssignments,
        });
      },
      "Assign user to FusionAuth groups on payment intent success event."
    );

    console.info(
      `We added FusionAuth user ${userId} to ${groupIds.length} group${
        groupIds.length === 1 ? "" : "s"
      }.`
    );
  }
}
