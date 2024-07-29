import { SESClient } from "@aws-sdk/client-ses";

let client: SESClient;

/**
 * Get AWS SES client as a singleton.
 * @param awsRegion Region in which the SES service operates
 * @returns AWS SES client
 */
export function getSesClient(awsRegion: string): SESClient {
  if (!client) {
    client = new SESClient({ region: awsRegion });
  }

  return client;
}
