import FusionAuthClient from "@fusionauth/typescript-client";
import { IBuildConfiguration } from "../environment/data-models/build-configuration.interface";

let fusionAuth: FusionAuthClient;

/**
 * Get the FusionAuth client as a singleton.
 * @param environment Build environment metadata
 * @returns FusionAuth client.
 * @throws Error if the FusionAuth environment variables are not set
 */
export function getFusionAuth(
  environment: IBuildConfiguration
): FusionAuthClient {
  const apiKey = environment.auth.apiSecret;
  if (!apiKey) {
    throw new Error(
      "Environment variable for FusionAuth API secret is not set."
    );
  }

  const authUrl = environment.auth.url;
  if (!authUrl) {
    throw new Error("Environment variable for FusionAuth URL is not set.");
  }

  if (!fusionAuth) {
    fusionAuth = new FusionAuthClient(apiKey, authUrl);
  }

  return fusionAuth;
}
