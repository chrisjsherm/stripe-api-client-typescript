import { IBtxPatternConfiguration } from "./btx-pattern-configuration.interface";
import { IStreetAddressable } from "./street-addressable.interface";

/**
 * Organization or business.
 */
export interface IOrganization {
  id: string;
  name: string;
  mailingAddress: IStreetAddressable;
  btxPatternConfiguration: IBtxPatternConfiguration | null;
}
