/**
 * Authenticated user of the application.
 */
export interface AppUser {
  id: string;
  email: string;
  organizationId?: string;
}
