/**
 * Fields on the FusionAuth JSON Web Token.
 */
export interface IFusionAuthJwt {
  /**
   * Default fields
   */
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  jti: string;
  authenticationType: string;
  email: string;
  email_verified: boolean;
  applicationId: string;
  scope: string;
  roles: Array<string>;
  sid: string;
  auth_time: number;
  tid: string;

  /**
   * Custom fields added via lambda function.
   */
  full_name: string;
  mobile_phone: string;
  organization_id: string | undefined;
}
