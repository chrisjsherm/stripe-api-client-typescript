import { JSONSchemaType } from "ajv";
import { Column, Entity, ManyToOne, OneToMany, Relation } from "typeorm";
import {
  BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
  IBotulinumToxinTreatmentPatternViewModelCreate,
  IBotulinumToxinTreatmentPatternViewModelRead,
} from "./botulinum-toxin-treatment_JOIN_botulinum-toxin-pattern.entity";
import { CoreEntity } from "./core-entity.model";
import { PhysicalLocation } from "./physical-location.entity";

@Entity()
export class BotulinumToxinTreatment extends CoreEntity {
  @OneToMany(
    () => BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
    (patternAssociation) => patternAssociation.treatment,
    { cascade: true }
  )
  patterns: Relation<BotulinumToxinTreatment_JOIN_BotulinumToxinPattern[]>;

  @Column({ type: "uuid" })
  clinicianId: string;

  @Column({ type: "uuid", nullable: true })
  patientId: string;

  @ManyToOne(() => PhysicalLocation, { nullable: false })
  physicalLocation: Relation<PhysicalLocation>;

  @Column({ type: "uuid" })
  physicalLocationId: string;
}

/**
 * View model for creating a treatment.
 */
export interface IBotulinumToxinTreatmentViewModelCreate {
  patientId: string;
  physicalLocationId: string;
  treatmentPatterns: IBotulinumToxinTreatmentPatternViewModelCreate[];
}

/**
 * JSON validation schema for creating a treatment.
 */
export const schema: JSONSchemaType<IBotulinumToxinTreatmentViewModelCreate> = {
  type: "object",
  properties: {
    patientId: {
      type: "string",
      format: "uuid",
    },
    physicalLocationId: {
      type: "string",
      format: "uuid",
    },
    treatmentPatterns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          diluentMl: { type: "number" },
          priceChargedPerToxinUnitInBaseCurrencyUnits: { type: "number" },
          productId: { type: "string", format: "uuid" },
          patternId: { type: "string", format: "uuid" },
          toxinUnits: { type: "integer" },
        },
        required: [
          "diluentMl",
          "priceChargedPerToxinUnitInBaseCurrencyUnits",
          "productId",
          "patternId",
          "toxinUnits",
        ],
        minItems: 1,
        maxItems: 100,
        additionalProperties: false,
      },
    },
  },
  required: ["patientId", "physicalLocationId", "treatmentPatterns"],
  additionalProperties: false,
};

/**
 * View model for reading a treatment
 */
export interface IBotulinumToxinTreatmentViewModelRead {
  id: string;
  createdDateTime: string;
  clinician: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  treatmentPatterns: IBotulinumToxinTreatmentPatternViewModelRead[];
  totalPriceChargedInBaseCurrencyUnits: number;
}
