import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { backoffRetry } from "../helpers/backoff-retry.helper";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { AppDataSource } from "./data-source";

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
      const subscriptionRepository =
        AppDataSource.getRepository(ProductSubscription);
      await subscriptionRepository.insert([
        {
          title: "Startup",
          subtitle: "Train up to five professionals",
          priceInBaseUnits: 3900,
          currencyCode: "USD",
          groupMembershipsCsv:
            process.env.AUTH_GROUP_ID__SUBSCRIPTION_STARTUP_ANNUAL_REV_0,
          statementDescriptorSuffix: "1yr subscribe",
          adminCount: 1,
          userCount: 5,
          storageGb: 0.5,
        },
        {
          title: "Business",
          subtitle: "Train up to 25 professionals",
          priceInBaseUnits: 12900,
          currencyCode: "USD",
          groupMembershipsCsv:
            process.env.AUTH_GROUP_ID__SUBSCRIPTION_BUSINESS_ANNUAL_REV_0,
          statementDescriptorSuffix: "1yr subscribe",
          adminCount: 3,
          userCount: 25,
          storageGb: 2.5,
        },
      ]);
    }

    console.info("🔌 Database connected");
  } catch (error) {
    console.error("Database connection failed\n", error);
    throw error;
  }
}
