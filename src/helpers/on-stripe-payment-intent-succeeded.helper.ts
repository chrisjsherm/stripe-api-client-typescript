import FusionAuthClient, {
  GroupMember,
  MemberResponse,
} from "@fusionauth/typescript-client";
import ClientResponse from "@fusionauth/typescript-client/build/src/ClientResponse";
import * as createError from "http-errors";
import { Stripe } from "stripe";
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

  const groupIds =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_groupMembershipsCsv
    ].split(",");

  if (groupIds.length !== 0) {
    const groupAssignments = groupIds.reduce(
      (assignments: Record<string, GroupMember[]>, groupId: string) => {
        assignments[groupId] = [{ userId }];
        return assignments;
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
