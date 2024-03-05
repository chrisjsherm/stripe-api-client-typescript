import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the production build environment.
 * Modify the values below unless they are already using process.env['VAR'].
 */
export const productionConfiguration: Pick<IBuildConfiguration, "isDebug"> = {
  isDebug: false,
};
