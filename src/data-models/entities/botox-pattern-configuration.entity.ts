import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

/**
 * Standard botulinum toxin pattern within an organization.
 * Keys are description of the target and values are the cells on the grid
 * overlaid on the patient.
 */
@Entity()
export class BotoxPatternConfiguration extends CoreEntity {
  @Column("jsonb")
  configuration: { [key: string]: number[] };

  @OneToOne(
    () => Organization,
    (organization) => organization.botoxPatternConfiguration
  )
  @JoinColumn()
  organization: Organization;
}
