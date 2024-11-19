import {} from "module";
import { DataSource } from "typeorm";
import { BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin-pattern.entity";
import { BotulinumToxinTreatment } from "../data-models/entities/botulinum-toxin-treatment.entity";
import { BotulinumToxinTreatment_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin-treatment_JOIN_botulinum-toxin-pattern.entity";
import { BotulinumToxin } from "../data-models/entities/botulinum-toxin.entity";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "../data-models/entities/botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import { Organization } from "../data-models/entities/organization.entity";
import { PhysicalLocation } from "../data-models/entities/physical-location.entity";
import { ProductSubscription } from "../data-models/entities/product-subscription.entity";
import { Product } from "../data-models/entities/product.entity";
import { getEnvironmentConfiguration } from "../helpers/get-environment-configuration.helper";
import { Initial1721833505708 } from "./migrations/1721833505708-initial";
import { Treatment1725565055175 } from "./migrations/1725565055175-Treatment";
import { TreatmentJOINPattern1725632907196 } from "./migrations/1725632907196-treatment-JOIN-pattern";
import { TreatmentClinicianId1725889970874 } from "./migrations/1725889970874-TreatmentClinicianId";
import { TreatmentLocation1727104118401 } from "./migrations/1727104118401-treatment-location";
import { MailRecipientName1728920227286 } from "./migrations/1728920227286-mail-recipient-name";
import { TreatmentPatientId1732027778661 } from "./migrations/1732027778661-treatment-patientId";

const { db: config } = getEnvironmentConfiguration();

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
    BotulinumToxin_JOIN_BotulinumToxinPattern,
    BotulinumToxin,
    BotulinumToxinPattern,
    BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
    BotulinumToxinTreatment,
    Organization,
    PhysicalLocation,
    Product,
    ProductSubscription,
  ],
  subscribers: [],
  migrations: [
    Initial1721833505708,
    Treatment1725565055175,
    TreatmentJOINPattern1725632907196,
    TreatmentClinicianId1725889970874,
    TreatmentLocation1727104118401,
    MailRecipientName1728920227286,
    TreatmentPatientId1732027778661,
  ],
  migrationsRun: true,
});
