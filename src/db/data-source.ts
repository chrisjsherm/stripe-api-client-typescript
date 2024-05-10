import { DataSource } from "typeorm";
import { BotoxPatternConfiguration } from "../data-models/entities/botox-pattern-configuration.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { Product } from "../data-models/entities/product.entity";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";

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
  dropSchema: true, // TODO: Use migrations before prod
  synchronize: true, // TODO: Remove before prod
  logging: true,
  entities: [BotoxPatternConfiguration, Organization, Product],
  subscribers: [],
  migrations: [],
});
