import { Column } from "typeorm";
import { StreetAddressType } from "../enums/street-address-type.enum";
import { IStreetAddressable } from "../interfaces/street-addressable.interface";

/**
 * Location in street address format.
 */
export class StreetAddress implements IStreetAddressable {
  @Column({ type: "varchar", nullable: false })
  street1: string;

  @Column({ type: "varchar" })
  street2: string | null;

  @Column({ type: "varchar", nullable: false })
  city: string;

  @Column({ type: "varchar", nullable: false })
  state: string;

  @Column({ type: "varchar", nullable: false })
  postalCode: string;

  @Column({ type: "varchar", nullable: false })
  country: string;

  @Column({
    type: "enum",
    enum: StreetAddressType,
    default: StreetAddressType.Mailing,
  })
  streetAddressType: StreetAddressType;
}
