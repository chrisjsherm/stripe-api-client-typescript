/**
 * Decoded FusionAuth access token with friendlier property names.
 */
export interface DecodedAccessToken {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  roles: Array<string>;

  mobilePhone?: string;
  organizationId?: string;
  stripeCustomerId?: string;
}
