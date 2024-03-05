import {
  FlattenedJWSInput,
  JWSHeaderParameters,
  KeyLike,
  createRemoteJWKSet,
} from "jose";
import { ConstantConfiguration } from "../services/constant-configuration.service";
import { getEnvironmentConfiguration } from "./get-environment-configuration.helper";

const config = getEnvironmentConfiguration();
let client: JwksClient;

/**
 * Get client for retrieving, caching, and verifying JSON Web Key Sets (JWKS) as
 * a singleton.
 * @returns JWKS client
 */
export function getJwksClient(): JwksClient {
  if (!client) {
    client = createRemoteJWKSet(
      new URL(`${config.auth.url}${ConstantConfiguration.fusionAuth_jwksRoute}`)
    );
  }

  return client;
}

type JwksClient = (
  protectedHeader?: JWSHeaderParameters | undefined,
  token?: FlattenedJWSInput | undefined
) => Promise<KeyLike>;
