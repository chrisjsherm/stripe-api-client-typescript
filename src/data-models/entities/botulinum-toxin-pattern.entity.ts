import { JSONSchemaType } from "ajv";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Relation,
} from "typeorm";
import { BotulinumToxin } from "./botulinum-toxin.entity";
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

  @ManyToMany(() => BotulinumToxin)
  @JoinTable()
  toxins: Relation<BotulinumToxin[]>;

  @ManyToOne(() => Organization, { nullable: false })
  organization: Relation<Organization>;

  @Column({ type: "uuid" })
  organizationId: string;
}

/**
 * Representation of the pattern to send to API clients.
 */
export interface IBotulinumToxinPatternViewModel {
  id: string;
  name: string;
  locations: number[];
  toxinIds: string[];
}

/**
 * JSON validation schema for toxin pattern.
 */
export const botulinumToxinPatternViewModelJsonSchema: JSONSchemaType<IBotulinumToxinPatternViewModel> =
  {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      locations: {
        type: "array",
        items: {
          type: "number",
        },
      },
      toxinIds: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["name", "locations", "toxinIds"],
    additionalProperties: false,
  };
