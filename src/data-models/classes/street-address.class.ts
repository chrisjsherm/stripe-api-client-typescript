import { Column } from "typeorm";
import { StreetAddressType } from "../enums/street-address-type.enum";
import { IStreetAddressable } from "../interfaces/street-addressable.interface";

/**
 * Location in street address format.
 */
export class StreetAddress implements IStreetAddressable {
  @Column({ type: "varchar" })
  street1: string;

  @Column({ type: "varchar", nullable: true })
  street2: string | null;

  @Column({ type: "varchar" })
  city: string;

  @Column({ type: "varchar" })
  state: string;

  @Column({ type: "varchar" })
  postalCode: string;

  @Column({ type: "varchar" })
  country: string;

  @Column({
    type: "enum",
    enum: StreetAddressType,
    default: StreetAddressType.Mailing,
  })
  streetAddressType: StreetAddressType;
}
