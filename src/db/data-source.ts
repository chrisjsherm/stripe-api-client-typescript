import {} from "module";
import { DataSource } from "typeorm";
import { BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { Product } from "../data-models/entities/product.entity";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { Initial1721833505708 } from "./migrations/1721833505708-initial";

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
  entities: [
    BotulinumToxin,
    BotulinumToxinPattern,
    BotulinumToxin_JOIN_BotulinumToxinPattern,
    Organization,
    Product,
    ProductSubscription,
  ],
  subscribers: [],
  migrations: [Initial1721833505708],
});
