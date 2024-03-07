import Stripe from "stripe";

/**
 * Handle a PaymentIntent failed event.
 * @param paymentIntent PaymentIntent for which the charge failed
 */
export function onPaymentIntentFailedEvent(
  paymentIntent: Stripe.PaymentIntent
): void {
  console.info(`❗️ Payment failed for payment intent ${paymentIntent.id}.`);
}
