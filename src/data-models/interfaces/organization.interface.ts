import { IStreetAddressable } from "./street-addressable.interface";

/**
 * Organization or business.
 */
export interface IOrganization {
  id: string;
  name: string;
  mailingAddress: IStreetAddressable;
  mailRecipientName?: string;
}
