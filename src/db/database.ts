import { DataSource } from "typeorm";
import { backoffRetry } from "../helpers/backoff-retry.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { AppDataSource } from "./data-source";
import { insertSeedProducts } from "./seed-data/product.seed-data";

const config = getEnvironmentConfiguration();

/**
 * Initialize the database connection.
 * @returns {Promise<DataSource>} database connection
 * @throws {Error} If the database connection fails.
 */
export async function initializeDatabase(): Promise<DataSource> {
  console.info(
    `🚀 Initializing database connection to ${config.db.host}:${config.db.port}`
  );
  try {
    const dataSource = await backoffRetry(
      5,
      1000,
      () => AppDataSource.initialize(),
      "Database connection"
    );

    if (config.upsertSeedData) {
      await insertSeedProducts(config);
    }

    console.info("🔌 Database connected");
    return dataSource;
  } catch (error) {
    console.error("❗️ Database connection failed\n", error);
    throw error;
  }
}
