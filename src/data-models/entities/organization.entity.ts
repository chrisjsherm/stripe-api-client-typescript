import { Column, Entity, OneToOne } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { IOrganization } from "../interfaces/organization.interface";
import { BotoxPatternConfiguration } from "./botox-pattern-configuration.entity";
import { CoreEntity } from "./core-entity.model";

/**
 * Organization database entity.
 */
@Entity()
export class Organization extends CoreEntity implements IOrganization {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column(() => StreetAddress)
  mailingAddress: StreetAddress;

  @OneToOne(() => BotoxPatternConfiguration, (pattern) => pattern.organization)
  botoxPatternConfiguration: BotoxPatternConfiguration;
}
