import { JSONSchemaType } from "ajv";

/**
 * Pattern configuration represents a set of botulinum toxin targets and the
 * injection location(s) for each target. The injection location is a numeric
 * ID the client can map to a visual.
 */
export interface IBtxPatternConfiguration {
  [key: string]: number[];
}

/**
 * AJV validation schema.
 */
export const btxPatternConfigurationJsonSchema: JSONSchemaType<IBtxPatternConfiguration> =
  {
    type: "object",
    minProperties: 1,
    maxProperties: 250,
    additionalProperties: {
      type: "array",
      items: {
        type: "number",
      },
    },
    required: [],
  };
