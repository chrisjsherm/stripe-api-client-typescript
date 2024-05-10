import { backoffRetry } from "../helpers/backoff-retry.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { AppDataSource } from "./data-source";
import { insertMockProducts } from "./mock-data/product.mock-data";

const config = getEnvironmentConfiguration();

/**
 * Initialize the database connection.
 * @returns {Promise<void>}
 * @throws {Error} If the database connection fails.
 */
export async function initializeDatabase() {
  try {
    await backoffRetry(
      5,
      1000,
      () => AppDataSource.initialize(),
      "Database connection"
    );

    if (config.isDebug && config.insertTestData) {
      await insertMockProducts();
    }

    console.info("🔌 Database connected");
  } catch (error) {
    console.error("Database connection failed\n", error);
    throw error;
  }
}
