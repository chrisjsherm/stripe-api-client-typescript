import { JSONSchemaType } from "ajv";

/**
 * Contact form completed by a customer.
 */
export interface ContactForm {
  fromEmailAddress: string;
  fromName: string;
  message: string;
  subject: string;

  cfTurnstileResponse?: string;
}

/**
 * Validation schema for the contact form.
 */
export const contactFormJsonSchema: JSONSchemaType<ContactForm> = {
  type: "object",
  properties: {
    fromEmailAddress: { type: "string", format: "email" },
    fromName: { type: "string", minLength: 2, maxLength: 128 },
    message: { type: "string", minLength: 3, maxLength: 2048 },
    subject: { type: "string", minLength: 2, maxLength: 50 },
    cfTurnstileResponse: { type: "string", nullable: true, maxLength: 128 },
  },
  required: ["fromEmailAddress", "fromName", "message", "subject"],
  additionalProperties: false,
};
