import {} from "module";
import { DataSource } from "typeorm";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { Product } from "../data-models/entities/product.entity";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { Initial1717769515809 } from "./migrations/1717769515809-initial";
import { OrganizationToxins1718112213745 } from "./migrations/1718112213745-organization_toxins";
import { BotulinumToxinEntity1718130790731 } from "./migrations/1718130790731-botulinum-toxin-entity";
import { BotulinumToxinRequireOrg1718131345277 } from "./migrations/1718131345277-BotulinumToxin_requireOrg";

const { db: config } = getEnvironmentConfiguration();

console.log(`username: ${config.username}`);
/**
 * Database connection configuration.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.name,
  dropSchema: false,
  synchronize: false,
  logging: true,
  entities: [BotulinumToxin, Organization, Product, ProductSubscription],
  subscribers: [],
  migrations: [
    Initial1717769515809,
    OrganizationToxins1718112213745,
    BotulinumToxinEntity1718130790731,
    BotulinumToxinRequireOrg1718131345277,
  ],
});
