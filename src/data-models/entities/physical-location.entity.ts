import { Column, Entity, ManyToOne } from "typeorm";
import { StreetAddress } from "../classes/street-address.class";
import { CoreEntity } from "./core-entity.model";
import { Organization } from "./organization.entity";

@Entity()
export class PhysicalLocation extends CoreEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column(() => StreetAddress)
  physicalAddress: StreetAddress;

  @ManyToOne(
    () => Organization,
    (organization) => organization.physicalLocations
  )
  organization: Organization;

  @Column({ type: "uuid" })
  organizationId: string;
}
