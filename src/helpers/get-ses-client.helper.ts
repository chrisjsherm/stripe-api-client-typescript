import { SESClient } from "@aws-sdk/client-ses";

let client: SESClient;

/**
 * Get AWS SES client as a singleton.
 * @returns AWS SES client
 */
export function getSesClient(): SESClient {
  if (!client) {
    client = new SESClient();
  }

  return client;
}
