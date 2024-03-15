import { SSMClient } from "@aws-sdk/client-ssm";

let client: SSMClient;

/**
 * Get AWS SSM client as a singleton.
 * @returns SSM Client
 */
export function getSsmClient(): SSMClient {
  if (!client) {
    client = new SSMClient();
  }

  return client;
}
