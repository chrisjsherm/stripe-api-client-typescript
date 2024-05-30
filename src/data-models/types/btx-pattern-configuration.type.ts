import { JSONSchemaType } from "ajv";

/**
 * List of injection targets with their location IDs.
 * The location ID corresponds to a cell in a matrix.
 */
export type BtxPatternConfiguration = Array<{
  target: string;
  locations: Array<number>;
}>;

/**
 * AJV validation schema.
 */
export const btxPatternConfigurationJsonSchema: JSONSchemaType<BtxPatternConfiguration> =
  {
    type: "array",
    minItems: 1,
    maxItems: 250,
    items: {
      type: "object",
      properties: {
        target: {
          type: "string",
        },
        locations: {
          type: "array",
          items: {
            type: "number",
          },
          maxItems: 100,
        },
      },
      required: ["target", "locations"],
      additionalProperties: false,
    },
  };
