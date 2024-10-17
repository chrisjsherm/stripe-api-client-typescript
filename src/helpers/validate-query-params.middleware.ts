import { JSONSchemaType } from "ajv";
import { NextFunction, Request, Response } from "express";
import { getJsonValidator } from "./get-validator.helper";

const jsonValidator = getJsonValidator();

/**
 * Generate middleware for validating query params of a request using the
 * given JSON schema.
 * @param schema JSON schema from which to generate the validator
 * @returns ExpressJS middleware handler
 */
export function generateQueryParamValidator<T>(
  schema: JSONSchemaType<T>
): (req: Request, res: Response, next: NextFunction) => void {
  const validate = jsonValidator.compile(schema);
  return function validateRequestBody(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const isValid = validate(req.query);
    if (!isValid) {
      res.status(400).json({ errors: validate.errors });
    } else {
      next();
    }
  };
}
