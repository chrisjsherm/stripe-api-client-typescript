import { Column, Entity } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { IBotulinumToxin } from "../interfaces/botulinum-toxin.interface";
import { IOrganization } from "../interfaces/organization.interface";
import { BtxPatternConfiguration } from "../types/btx-pattern-configuration.type";
import { CoreEntity } from "./core-entity.model";

/**
 * Organization database entity.
 */
@Entity()
export class Organization extends CoreEntity implements IOrganization {
  @Column({ type: "varchar" })
  name: string;

  @Column(() => StreetAddress)
  mailingAddress: StreetAddress;

  @Column("jsonb", { nullable: true })
  btxPatternConfiguration: BtxPatternConfiguration | null;

  @Column("jsonb", { nullable: true })
  botulinumToxins: IBotulinumToxin[] | null;
}
