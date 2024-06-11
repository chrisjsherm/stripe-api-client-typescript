import { JSONSchemaType } from "ajv";
import { Column, Entity, ManyToOne, Relation } from "typeorm";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

/**
 * @description Botulinum toxin product information.
 */
export interface IBotulinumToxin {
  id: string;
  name: string;
  vialSizeInUnits: VialSizes;
  pricePerUnitInBaseCurrencyUnits: number;
}

/**
 * Botulinum toxin entity.
 */
@Entity()
export class BotulinumToxin extends CoreEntity implements IBotulinumToxin {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "int" })
  vialSizeInUnits: VialSizes;

  @Column({ type: "int" })
  pricePerUnitInBaseCurrencyUnits: number;

  @ManyToOne(() => Organization)
  organization: Relation<Organization>;
}

/**
 * JSON validation schema for botulinum toxin.
 */
export const botulinumToxinJsonSchema: JSONSchemaType<IBotulinumToxin> = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    vialSizeInUnits: {
      type: "integer",
      enum: [50, 100, 200, 300, 500],
    },
    pricePerUnitInBaseCurrencyUnits: {
      type: "integer",
    },
  },
  required: ["name", "vialSizeInUnits", "pricePerUnitInBaseCurrencyUnits"],
  additionalProperties: false,
};

/**
 * Acceptable toxin vial sizes.
 */
enum VialSizes {
  "Fifty" = 50,
  "One Hundred" = 100,
  "Two Hundred" = 200,
  "Three Hundred" = 300,
  "Five Hundred" = 500,
}
