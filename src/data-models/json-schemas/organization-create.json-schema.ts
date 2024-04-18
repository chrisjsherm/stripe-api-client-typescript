import { JSONSchemaType } from "ajv";
import { IOrganization } from "../interfaces/organization.interface";
import { streetAddressJsonSchema } from "./street-address.json-schema";

/**
 * Validation schema for creating an organization.
 */
export const createOrganizationJsonSchema: JSONSchemaType<
  Omit<IOrganization, "id">
> = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 128 },
    mailingAddress: { $ref: "#/definitions/streetAddress" },
  },
  required: ["name", "mailingAddress"],
  additionalProperties: false,
  definitions: {
    streetAddress: streetAddressJsonSchema,
  },
};
