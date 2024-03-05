import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the production build environment.
 */
export const productionConfiguration: Pick<IBuildConfiguration, "isDebug"> = {
  isDebug: false,
};
