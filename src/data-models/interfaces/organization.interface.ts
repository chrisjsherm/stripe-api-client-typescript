import { BtxPatternConfiguration } from "../types/btx-pattern-configuration.type";
import { IBotulinumToxin } from "./botulinum-toxin.interface";
import { IStreetAddressable } from "./street-addressable.interface";

/**
 * Organization or business.
 */
export interface IOrganization {
  id: string;
  name: string;
  mailingAddress: IStreetAddressable;

  btxPatternConfiguration: BtxPatternConfiguration | null;
  botulinumToxins: IBotulinumToxin[] | null;
}
