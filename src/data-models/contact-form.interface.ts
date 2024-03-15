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
    fromName: { type: "string" },
    message: { type: "string" },
    subject: { type: "string" },
    cfTurnstileResponse: { type: "string", nullable: true },
  },
  required: ["fromEmailAddress", "fromName", "message", "subject"],
  additionalProperties: false,
};
