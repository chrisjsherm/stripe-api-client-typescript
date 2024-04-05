/**
 * Authenticated user of the application.
 */
export interface AppUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;

  mobilePhone?: string;
  organizationId?: string;
}
