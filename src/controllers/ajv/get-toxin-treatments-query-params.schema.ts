import { JSONSchemaType } from "ajv";

/**
 * JSON schema for validating the getToxinTreatments request.
 */
export const getToxinTreatmentsQueryParamsJsonSchema: JSONSchemaType<{
  dateStart: string;
  dateEnd: string;
}> = {
  type: "object",
  properties: {
    dateStart: {
      type: "string",
      format: "date-time",
    },
    dateEnd: {
      type: "string",
      format: "date-time",
    },
    clinicianId: {
      type: "string",
      format: "uuid",
    },
    locationId: {
      type: "string",
      format: "uuid",
    },
  },
  required: ["dateStart", "dateEnd"],
  additionalProperties: false,
};
