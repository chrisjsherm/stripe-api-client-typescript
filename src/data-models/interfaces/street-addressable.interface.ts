import { StreetAddressType } from "../enums/street-address-type.enum";

/**
 * Location in street address format.
 */
export interface IStreetAddressable {
  street1: string;
  street2: string | null | undefined;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  streetAddressType: StreetAddressType;
}
