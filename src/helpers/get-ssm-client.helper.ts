import { SSMClient } from "@aws-sdk/client-ssm";

let client: SSMClient;

/**
 * Get AWS SSM client as a singleton.
 * @param awsRegion Region in which the SSM service operates
 * @returns SSM Client
 */
export function getSsmClient(awsRegion: string): SSMClient {
  if (!client) {
    client = new SSMClient({ region: awsRegion });
  }

  return client;
}
