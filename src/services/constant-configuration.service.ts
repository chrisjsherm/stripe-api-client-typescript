/**
 * Constant configuration values that are not intended to be configurable.
 */
export const ConstantConfiguration = {
  fusionAuth_cookie_accessToken: "app.at",
  fusionAuth_cookiePrefix_knownDevice: "fusionauth.known-device.",
  fusionAuth_jwksRoute: "/.well-known/jwks.json",
  fusionAuth_user_data_organizationId: "organizationId",
  fusionAuth_user_data_stripeCustomerId: "stripeCustomerId",

  stripe_customer_metadata_fusionAuthUserId: "tenant__user_id",
  stripe_paymentIntent_metadata_productIdsCsv: "product_ids",
  stripe_paymentIntent_metadata_organizationId: "organization_id",
  stripe_paymentIntent_metadata_userId: "tenant__user_id",

  queryParam_clinicianId: "clinicianId",
};
