import { JSONSchemaType } from "ajv";
import { ICreatePaymentIntentRequestBody } from "./create-payment-intent-request-body.interface";
import { streetAddressJsonSchema } from "./street-address.json-schema";

/**
 * Validation schema for creating a payment intent.
 */
export const createPaymentIntentRequestBodyJsonSchema: JSONSchemaType<ICreatePaymentIntentRequestBody> =
  {
    type: "object",
    properties: {
      productId: { type: "string" },
      organization: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          mailingAddress: { $ref: "#/definitions/streetAddress" },
        },
        required: ["name", "mailingAddress"],
      },
    },
    required: ["productId", "organization"],
    definitions: {
      streetAddress: streetAddressJsonSchema,
    },
    additionalProperties: false,
  };
