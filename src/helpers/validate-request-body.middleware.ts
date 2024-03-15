import { JSONSchemaType } from "ajv";
import { NextFunction, Request, Response } from "express";
import { getJsonValidator } from "./get-validator.helper";

const jsonValidator = getJsonValidator();

/**
 * Generate middleware for validating a request body using a JSON schema.
 * @param schema JSON schema to generate the validator from
 * @returns ExpressJS middleware handler
 */
export function generateRequestBodyValidator<T>(
  schema: JSONSchemaType<T>
): (req: Request, res: Response, next: NextFunction) => void {
  const validate = jsonValidator.compile(schema);
  return function validateRequestBody(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const valid = validate(req.body);
    if (!valid) {
      res.status(400).json({ errors: validate.errors });
    } else {
      next();
    }
  };
}
