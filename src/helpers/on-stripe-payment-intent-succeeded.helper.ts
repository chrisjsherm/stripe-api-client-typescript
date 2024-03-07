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
import { getStripeCustomerById$ } from "./get-stripe-customer-by-id.helper";

/**
 * Handle a PaymentIntent success event.
 * @param paymentIntent Payment intent from which the successful charge originated
 * @param config Build configuration
 * @param authClient FusionAuth client
 * @param stripeClient Stripe API client
 * @param res HTTP response
 * @returns Promise
 * @throws Error
 */
export async function onPaymentIntentSucceededEvent$(
  paymentIntent: Stripe.PaymentIntent,
  config: IBuildConfiguration,
  authClient: FusionAuthClient,
  stripeClient: Stripe
): Promise<void> {
  console.info(
    `${new Date().toUTCString()}:💰 Payment captured for payment intent ${
      paymentIntent.id
    }.`
  );

  const fusionAuthUserId: string | undefined =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_customerId
    ];
  if (fusionAuthUserId === undefined) {
    throw createError.BadRequest(
      `❗️ Payment intent ${paymentIntent.id} does not have a FusionAuth user ` +
        "associated with it."
    );
  }

  if (typeof paymentIntent.customer !== "string") {
    throw createError.BadRequest(
      `❗️ Payment intent ${paymentIntent.id} does not have a Stripe Customer ` +
        "associated with it."
    );
  }

  const stripeCustomer = await getStripeCustomerById$(
    paymentIntent.customer,
    stripeClient
  );
  if (
    stripeCustomer.metadata[
      ConstantConfiguration.stripe_customer_metadata_fusionAuthUserId
    ] !== fusionAuthUserId
  ) {
    throw createError.Conflict(
      `❗️ Payment intent ${paymentIntent.id} has a mismatch between its Stripe ` +
        `customer ID (${paymentIntent.customer}) and the FusionAuth user ID ` +
        `in its metadata (${fusionAuthUserId}).`
    );
  }

  const groupIds =
    paymentIntent.metadata[
      ConstantConfiguration.stripe_paymentIntent_metadata_groupMembershipsCsv
    ].split(",");

  if (groupIds.length !== 0) {
    const groupAssignments = groupIds.reduce(
      (assignments: Record<string, GroupMember[]>, groupId: string) => {
        assignments[groupId] = [{ userId: fusionAuthUserId }];
        return assignments;
      },
      {}
    );

    await backoffRetry<ClientResponse<MemberResponse>>(
      3,
      config.http.retryDelayMs,
      () => {
        return authClient.createGroupMembers({
          members: groupAssignments,
        });
      },
      "Assign user to FusionAuth groups on PaymentIntent success event."
    );

    console.info(
      `🔔 Added FusionAuth user ${fusionAuthUserId} to ${
        groupIds.length
      } group${groupIds.length === 1 ? "" : "s"}.`
    );
  }
}
