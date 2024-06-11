import { BtxPatternConfiguration } from "../types/btx-pattern-configuration.type";
import { IStreetAddressable } from "./street-addressable.interface";

/**
 * Organization or business.
 */
export interface IOrganization {
  id: string;
  name: string;
  mailingAddress: IStreetAddressable;

  btxPatternConfiguration: BtxPatternConfiguration | null;
}
