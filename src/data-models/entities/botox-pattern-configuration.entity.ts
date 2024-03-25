import { Column, Entity } from "typeorm";
import { CoreEntity } from "./core-entity.model";

/**
 * Standard botulinum toxin pattern within an organization.
 * Keys are description of the target and values are the cells on the grid
 * overlaid on the patient.
 */
@Entity()
export class BotoxPatternConfiguration extends CoreEntity {
  @Column("uuid")
  organizationId: string;

  @Column("jsonb")
  configuration: { [key: string]: number[] };
}
