/**
 * Constant configuration values that are not intended to be configurable.
 */
export const ConstantConfiguration = {
  fusionAuth_accessTokenCookie: "app.at",
  fusionAuth_jwksRoute: "/.well-known/jwks.json",
  fusionAuth_user_data_organizationId: "organizationId",
  fusionAuth_user_data_stripeCustomerId: "stripeCustomerId",

  stripe_customer_metadata_fusionAuthUserId: "tenant__user_id",
  stripe_paymentIntent_metadata_userId: "tenant__user_id",
  stripe_paymentIntent_metadata_groupMembershipsCsv: "group_memberships",
};
