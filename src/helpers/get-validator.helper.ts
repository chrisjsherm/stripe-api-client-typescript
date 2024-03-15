import Ajv from "ajv";

let validator: Ajv;

/**
 * Get the JSON schema validator as a singleton.
 * @returns Validator
 */
export function getJsonValidator() {
  if (!validator) {
    validator = new Ajv();
  }

  return validator;
}
