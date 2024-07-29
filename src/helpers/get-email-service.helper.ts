import { EmailService } from "../services/email/email.service";
import { getSesClient } from "./get-ses-client.helper";

let service: EmailService;

/**
 * Get email service as a singleton.
 * @param awsRegion Region in which the SES service operates
 * @returns Email service
 */
export function getEmailService(awsRegion: string): EmailService {
  if (!service) {
    service = new EmailService(getSesClient(awsRegion));
  }

  return service;
}
