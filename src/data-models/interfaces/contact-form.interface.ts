import { JSONSchemaType } from "ajv";

/**
 * Contact form completed by a customer.
 */
export interface ContactForm {
  captchaToken: string;
  fromEmailAddress: string;
  fromName: string;
  message: string;
  subject: string;
}

/**
 * Validation schema for the contact form.
 */
export const contactFormJsonSchema: JSONSchemaType<ContactForm> = {
  type: "object",
  properties: {
    captchaToken: { type: "string", maxLength: 2048 },
    fromEmailAddress: { type: "string", format: "email", maxLength: 254 },
    fromName: { type: "string", minLength: 2, maxLength: 128 },
    message: { type: "string", minLength: 3, maxLength: 2048 },
    subject: { type: "string", minLength: 2, maxLength: 50 },
  },
  required: [
    "captchaToken",
    "fromEmailAddress",
    "fromName",
    "message",
    "subject",
  ],
  additionalProperties: false,
};
