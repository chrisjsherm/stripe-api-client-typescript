/**
 * Throw an error if any of the supplied environment variable keys do not have
 * a value.
 * @param requiredKeys Required environment variable keys
 */
export function throwIfEnvNotSet(...requiredKeys: string[]): void {
  for (const key of requiredKeys) {
    if (process.env[key] === undefined || process.env[key] === '') {
      throw new Error(`Environment variable ${key} is not set`);
    }
  }
}
