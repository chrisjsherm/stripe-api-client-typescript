import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the development build environment.
 */
export const developmentConfiguration: Pick<
  IBuildConfiguration,
  "isDebug" | "upsertSeedData"
> = {
  isDebug: true,
  upsertSeedData: process.env.WEB_API_UPSERT_SEED_DATA === "true",
};
