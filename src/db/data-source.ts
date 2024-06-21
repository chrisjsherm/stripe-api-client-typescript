import {} from "module";
import { DataSource } from "typeorm";
import { BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { Product } from "../data-models/entities/product.entity";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { Initial1717769515809 } from "./migrations/1717769515809-initial";
import { OrganizationToxins1718112213745 } from "./migrations/1718112213745-organization_toxins";
import { BotulinumToxinEntity1718130790731 } from "./migrations/1718130790731-botulinum-toxin-entity";
import { BotulinumToxinRequireOrg1718131345277 } from "./migrations/1718131345277-BotulinumToxin_requireOrg";
import { AddPatternEntity1718716800243 } from "./migrations/1718716800243-add-pattern-entity";
import { RemovePatternFromOrg1718718846765 } from "./migrations/1718718846765-remove-pattern-from-org";
import { SubscriptionExplicitColumns1718820192140 } from "./migrations/1718820192140-subscription_explicit-columns";
import { CreateToxinPatternEntity1718997422718 } from "./migrations/1718997422718-create-toxin-pattern-entity";

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
  migrations: [
    Initial1717769515809,
    OrganizationToxins1718112213745,
    BotulinumToxinEntity1718130790731,
    BotulinumToxinRequireOrg1718131345277,
    AddPatternEntity1718716800243,
    RemovePatternFromOrg1718718846765,
    SubscriptionExplicitColumns1718820192140,
    CreateToxinPatternEntity1718997422718,
  ],
});
