import { JSONSchemaType } from "ajv";
import { Column, Entity, ManyToOne, OneToMany, Relation } from "typeorm";
import { BotulinumToxin_JOIN_BotulinumToxinPattern } from "./botulinum-toxin_JOIN_botulinum-toxin-pattern.entity";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

/**
 * Botulinum toxin pattern database entity
 */
@Entity()
export class BotulinumToxinPattern extends CoreEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "jsonb" })
  locations: number[];

  @ManyToOne(() => Organization, { nullable: false })
  organization: Relation<Organization>;

  @Column({ type: "uuid" })
  organizationId: string;

  @OneToMany(
    () => BotulinumToxin_JOIN_BotulinumToxinPattern,
    (toxinAssociation) => toxinAssociation.pattern
  )
  toxinAssociations: Relation<BotulinumToxin_JOIN_BotulinumToxinPattern[]>;
}

/**
 * Representation of the pattern to send to API clients.
 */
export interface IBotulinumToxinPatternViewModel {
  id: string;
  name: string;
  locations: number[];
  referenceDoseByToxinId: { [id: string]: number };
}

/**
 * JSON validation schema for toxin pattern.
 */
export const botulinumToxinPatternViewModelJsonSchema: JSONSchemaType<IBotulinumToxinPatternViewModel> =
  {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string", minLength: 1, maxLength: 15 },
      locations: {
        type: "array",
        items: {
          type: "number",
        },
        minItems: 1,
        maxItems: 100,
      },
      referenceDoseByToxinId: {
        type: "object",
        additionalProperties: {
          type: "number",
          minimum: 1,
          maximum: 10000,
        },
        required: [],
      },
    },
    required: ["name", "locations", "referenceDoseByToxinId"],
    additionalProperties: false,
  };
