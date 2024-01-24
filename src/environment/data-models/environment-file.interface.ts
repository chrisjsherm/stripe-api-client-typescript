import { IBuildConfiguration } from "./build-configuration.interface";

/**
 * Configuration for a build environment and where to write the file containing
 * the configuration.
 */
export interface IEnvironmentFile {
  filePath: string;
  buildEnvironment: IBuildConfiguration;
}
