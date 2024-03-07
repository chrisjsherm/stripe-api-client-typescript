import Stripe from "stripe";

/**
 * Synchronize Stripe customer email to the FusionAuth user email, if different.
 * @param fusionAuthUser FusionAuth user
 * @param stripeCustomer Stripe customer
 * @param stripeClient Stripe API client
 * @returns Stripe customer
 * @throws StripeError
 */
export async function synchronizeCustomerEmail(
  fusionAuthUser: { id: string; email: string },
  stripeCustomer: Stripe.Customer,
  stripeClient: Stripe
): Promise<Stripe.Customer> {
  if (stripeCustomer.email === fusionAuthUser.email) {
    return stripeCustomer;
  }

  console.info(
    `Stripe customer ${stripeCustomer.id} email does not match ` +
      `FusionAuth user ${fusionAuthUser.id} email. Changing to match FusionAuth.`
  );
  const updatedStripeCustomer = await stripeClient.customers.update(
    stripeCustomer.id,
    {
      email: fusionAuthUser.email,
    }
  );
  console.info(
    `Stripe customer ${updatedStripeCustomer.id} email updated to ${fusionAuthUser.email}`
  );

  return updatedStripeCustomer;
}
