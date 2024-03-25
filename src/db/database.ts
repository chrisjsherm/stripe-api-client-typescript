import { backoffRetry } from "../helpers/backoff-retry.helper";
import { AppDataSource } from "./data-source";

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
    console.info("🔌 Database connected");
  } catch (error) {
    console.error("❗️ Database connection failed\n", error);
    throw error;
  }
}
