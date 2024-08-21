import { Product } from "../../data-models/entities/product.entity";
import { IBuildConfiguration } from "../../environment/data-models/build-configuration.interface";
import { AppDataSource } from "../data-source";

/**
 * Insert initial product data into the database.
 * @param environment Build environment configuration
 */
export async function insertSeedProducts(
  environment: IBuildConfiguration
): Promise<void> {
  const productRepository = AppDataSource.getRepository(Product);
  await productRepository.upsert(
    [
      {
        id: "27da8390-6606-4283-b793-6f8eb282476d",
        title: "Startup",
        subtitle: "Train up to five professionals",
        priceInBaseUnits: 6999,
        currencyCode: "USD",
        groupMembershipsCsv: environment.auth.groupId_subscriptionStartupAnnual,
        statementDescriptorSuffix: "1yr subscribe",
        adminCount: 1,
        userCount: 5,
        storageGb: 0.5,
      },
      {
        id: "d135c4c4-d45d-4b74-8419-0cc6f51c27f5",
        title: "Business",
        subtitle: "Train up to 25 professionals",
        priceInBaseUnits: 27999,
        currencyCode: "USD",
        groupMembershipsCsv:
          environment.auth.groupId_subscriptionBusinessAnnual,
        statementDescriptorSuffix: "1yr subscribe",
        adminCount: 3,
        userCount: 25,
        storageGb: 2.5,
      },
    ],
    {
      conflictPaths: ["id"],
      skipUpdateIfNoValuesChanged: true,
    }
  );
}
