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
  if (!fusionAuth) {
    fusionAuth = new FusionAuthClient(
      environment.auth.apiKey,
      environment.auth.url
    );
  }

  return fusionAuth;
}
