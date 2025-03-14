import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { HttpException } from "@exceptions/HttpException";

const validationMiddleware = (
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  type: any,
  value: string | "body" | "query" | "params" = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, _res, next) => {
    validate(plainToClass(type, req[value]), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(", ");

        type Message = { property: string; constraints: string };

        const errorsMessage: Message[] = errors.map((error: ValidationError) => {
          const message: Message = {
            property: error.property,
            constraints: Object.values(error.constraints)[0],
          };
          return message;
        });
        next(new HttpException(400, message, errorsMessage));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
