import { JSONSchemaType } from "ajv";
import { StreetAddressType } from "../enums/street-address-type.enum";
import { IStreetAddressable } from "./street-addressable.interface";

/**
 * Validation schema for street address.
 */
export const streetAddressJsonSchema: JSONSchemaType<IStreetAddressable> = {
  type: "object",
  properties: {
    street1: { type: "string", maxLength: 128 },
    street2: { type: "string", maxLength: 128, nullable: true },
    city: { type: "string", maxLength: 128 },
    state: { type: "string", maxLength: 2 },
    postalCode: { type: "string", pattern: "^([0-9]{5}){1}(-[0-9]{4})?$" },
    country: { type: "string", maxLength: 128 },
    streetAddressType: {
      type: "string",
      enum: Object.values(StreetAddressType),
    },
  },
  required: [
    "street1",
    "city",
    "state",
    "postalCode",
    "country",
    "streetAddressType",
  ],
  additionalProperties: false,
};
