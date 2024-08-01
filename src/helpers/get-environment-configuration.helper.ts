import { IBuildConfiguration } from "../environment/data-models/build-configuration.interface";
import { environment as productionEnvironment } from "../environment/environment";
import { environment as developmentEnvironment } from "../environment/environment.development";

let configuration: IBuildConfiguration;

/**
 * Get environment configuration object as a singleton.
 * @returns Environment configuration
 */
export function getEnvironmentConfiguration(): IBuildConfiguration {
  if (!configuration) {
    if (process.env.DEVELOPMENT === "true") {
      console.info("🚧 Using development mode environment variables.");
      configuration = developmentEnvironment;
    } else {
      console.info("🛫 Using production mode environment variables.");
      configuration = productionEnvironment;
    }
  }

  return configuration;
}
