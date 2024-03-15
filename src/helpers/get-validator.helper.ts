import Ajv from "ajv";
import addFormats from "ajv-formats";

let validator: Ajv;

/**
 * Get the JSON schema validator as a singleton.
 * @returns Validator
 */
export function getJsonValidator() {
  if (!validator) {
    validator = new Ajv();
    addFormats(validator);
  }

  return validator;
}
