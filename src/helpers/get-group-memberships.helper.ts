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
export async function getGroupMemberships$(
  stripeCustomerId: string,
  stripeClient: Stripe
): Promise<Set<string>> {
  const recentCharges = await getSuccessfulCharges$(
    stripeCustomerId,
    DateTime.now().minus({ year: 1 }),
    stripeClient,
    ["data.payment_intent"]
  );

  const memberships = recentCharges.reduce(
    (accumulated: Set<string>, charge: Stripe.Charge): Set<string> => {
      if (typeof charge.payment_intent === "string") {
        throw new Error(
          `Charge ${charge.id} does not have 'payment_intent' expanded.`
        );
      }

      const membershipsPaidFor =
        charge.payment_intent?.metadata[
          ConstantConfiguration
            .stripe_paymentIntent_metadata_groupMembershipsCsv
        ].split(",") ?? [];

      for (const membership of membershipsPaidFor) {
        accumulated.add(membership);
      }

      return accumulated;
    },
    new Set<string>()
  );

  return memberships;
}
