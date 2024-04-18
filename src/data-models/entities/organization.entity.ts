import { Column, Entity, OneToOne } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { BotoxPatternConfiguration } from "./botox-pattern-configuration.entity";
import { CoreEntity } from "./core-entity.model";

/**
 * Organization or business using the app.
 */
@Entity()
export class Organization extends CoreEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column(() => StreetAddress)
  mailingAddress: StreetAddress;

  @OneToOne(() => BotoxPatternConfiguration, (pattern) => pattern.organization)
  botoxPatternConfiguration: BotoxPatternConfiguration;
}
