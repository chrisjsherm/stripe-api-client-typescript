import { DateTime } from "luxon";
import Stripe from "stripe";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { getSuccessfulCharges$ } from "./get-successful-charges.helper";

/**
 * Get FusionAuth group memberships associated with a Stripe customer.
 * @param stripeCustomerId Stripe customer ID
 * @param stripeClient Stripe API client
 * @returns Array of FusionAuth group IDs
 */
export async function getGroupMembership$(
  stripeCustomerId: string,
  stripeClient: Stripe
): Promise<string[]> {
  const recentCharges = await getSuccessfulCharges$(
    stripeCustomerId,
    DateTime.now().minus({ year: 1 }),
    stripeClient,
    ["payment_intent"]
  );

  const memberships = recentCharges.reduce(
    (acc: Set<string>, charge: Stripe.Charge): Set<string> => {
      if (typeof charge.payment_intent === "string") {
        throw new Error(
          `Charge ${charge.id} does not have 'payment_intent' expanded.`
        );
      }

      const membershipsEnabled =
        charge.payment_intent?.metadata[
          ConstantConfiguration
            .stripe_paymentIntent_metadata_groupMembershipsCsv
        ].split(",") ?? [];

      for (const membership of membershipsEnabled) {
        acc.add(membership);
      }

      return acc;
    },
    new Set<string>()
  );

  return Array.from(memberships);
}
