import { JSONSchemaType } from "ajv";
import { Column, Entity, ManyToOne, OneToMany, Relation } from "typeorm";
import {
  BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
  IBotulinumToxinTreatmentPatternViewModelCreate,
  IBotulinumToxinTreatmentPatternViewModelRead,
} from "./botulinum-toxin-treatment_JOIN_botulinum-toxin-pattern.entity";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

@Entity()
export class BotulinumToxinTreatment extends CoreEntity {
  @OneToMany(
    () => BotulinumToxinTreatment_JOIN_BotulinumToxinPattern,
    (patternAssociation) => patternAssociation.treatment,
    { cascade: true }
  )
  patterns: Relation<BotulinumToxinTreatment_JOIN_BotulinumToxinPattern[]>;

  @ManyToOne(() => Organization, { nullable: false })
  organization: Relation<Organization>;

  @Column({ type: "uuid" })
  organizationId: string;
}

/**
 * View model for creating a treatment.
 */
export interface IBotulinumToxinTreatmentViewModelCreate {
  treatmentPatterns: IBotulinumToxinTreatmentPatternViewModelCreate[];
}

/**
 * JSON validation schema for creating a treatment.
 */
export const schema: JSONSchemaType<IBotulinumToxinTreatmentViewModelCreate> = {
  type: "object",
  properties: {
    treatmentPatterns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          diluentMl: { type: "number" },
          priceChargedPerToxinUnitInBaseCurrencyUnits: { type: "number" },
          productId: { type: "string" },
          patternId: { type: "string" },
          toxinUnits: { type: "integer" },
        },
        required: [
          "diluentMl",
          "priceChargedPerToxinUnitInBaseCurrencyUnits",
          "productId",
          "patternId",
          "toxinUnits",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["treatmentPatterns"],
  additionalProperties: false,
};

/**
 * View model for reading a treatment
 */
export interface IBotulinumToxinTreatmentViewModelRead {
  id: string;
  createdDateTime: string;
  treatmentPatterns: IBotulinumToxinTreatmentPatternViewModelRead[];
}
