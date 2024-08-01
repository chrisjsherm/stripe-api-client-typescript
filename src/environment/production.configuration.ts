import { IBuildConfiguration } from "./data-models/build-configuration.interface";

/**
 * Configuration for the production build environment.
 */
export const productionConfiguration: Pick<
  IBuildConfiguration,
  "isDebug" | "upsertSeedData"
> = {
  isDebug: false,
  upsertSeedData: process.env.WEB_API_UPSERT_SEED_DATA === "true",
};
