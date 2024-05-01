import * as createError from "http-errors";
import Stripe from "stripe";

/**
 * Retrieve a Stripe customer by its ID property.
 * @param stripeCustomerId Unique identifier of the Stripe customer
 * @param stripeClient Stripe API client
 * @returns Stripe customer
 * @throws Error
 */
export async function getStripeCustomerById$(
  stripeCustomerId: string,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  console.log(` Retrieving Stripe customer by ID: ${stripeCustomerId}`);
  const result = await stripeClient.customers.retrieve(stripeCustomerId);
  if (result.deleted) {
    throw createError.BadRequest(
      `Stripe Customer with ID ${stripeCustomerId} is marked deleted.`
    );
  }
  return result;
}
