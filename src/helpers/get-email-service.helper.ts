import { EmailService } from "../services/email/email.service";
import { getSesClient } from "./get-ses-client.helper";

let service: EmailService;

/**
 * Get email service as a singleton.
 * @returns Email service
 */
export function getEmailService(): EmailService {
  if (!service) {
    service = new EmailService(getSesClient());
  }

  return service;
}
