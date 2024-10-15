import { JSONSchemaType } from "ajv";
import { IOrganization } from "../interfaces/organization.interface";
import { streetAddressJsonSchema } from "./street-address.json-schema";

/**
 * Validation schema for creating an organization.
 */
export const createOrganizationJsonSchema: JSONSchemaType<
  Omit<IOrganization, "id" | "btxPatternConfiguration">
> = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 3, maxLength: 128 },
    mailRecipientName: {
      type: "string",
      minLength: 3,
      maxLength: 128,
      nullable: true,
    },
    mailingAddress: { $ref: "#/definitions/streetAddress" },
    physicalLocations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          physicalAddress: {
            $ref: "#/definitions/streetAddress",
          },
        },
        required: ["name", "physicalAddress"],
        additionalProperties: false,
      },
      minItems: 1,
      maxItems: 100,
    },
  },
  required: ["name", "mailingAddress"],
  additionalProperties: false,
  definitions: {
    streetAddress: streetAddressJsonSchema,
  },
};
