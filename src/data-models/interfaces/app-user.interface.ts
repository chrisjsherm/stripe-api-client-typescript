/**
 * Authenticated user of the application.
 */
export interface AppUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;

  mobilePhone?: string;
  organizationId?: string;
}
