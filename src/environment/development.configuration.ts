import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the development build environment.
 * Modify the values below unless they are already using process.env['VAR'].
 */
export const developmentConfiguration: Pick<IBuildConfiguration, "isDebug"> = {
  isDebug: true,
};
