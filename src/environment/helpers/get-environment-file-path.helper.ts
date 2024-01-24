import { BuildTarget } from "../data-models/build-target.enum";

/**
 * Generate the file path to the configuration for a build target.
 * @param environment Environment to generate the path for
 * @returns File path for the environment
 */
export function getEnvironmentFilePath(environment: BuildTarget): string {
  const baseFilePath = "./src/environment/environment";

  switch (environment) {
    case BuildTarget.Development:
      return `${baseFilePath}.development.ts`;

    case BuildTarget.Production:
      return `${baseFilePath}.ts`;
  }
}
