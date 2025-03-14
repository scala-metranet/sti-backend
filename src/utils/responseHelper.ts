import { Response, NextFunction } from "express";
//import { ValidationError } from 'express-validator';

export interface ResponseInterface {
  message?: string;
  data?: [] | Record<string, unknown>;
}

export const responseCodes = {
  ok: { code: 200, status: "Ok" },
  created: { code: 201, status: "Created" },
  deleted: { code: 204, status: "Deleted" },
  updated: { code: 204, status: "Updated" },
  no_content: { code: 204, status: "No Content" },
  see_other: { code: 303, status: "See Other" },
  bad_request: { code: 400, status: "Bad Request" },
  invalid_request: 400,
  unsupported_response_type: 400,
  invalid_scope: 400,
  invalid_grant: 400,
  invalid_credentials: { code: 400, status: "Invalid Credentials" },
  invalid_refresh: 400,
  no_data: { code: 400, status: "No Data" },
  invalid_data: { code: 400, status: "Invalid Data Input" },
  access_denied: 401,
  unauthorized: { code: 401, status: "Unauthorized" },
  invalid_client: 401,
  forbidden: 403,

  resource_not_found: { code: 404, status: "Not Found" },
  not_acceptable: 406,
  resource_exists: 409,
  conflict: 409,
  resource_gone: 410,
  payload_too_large: 413,
  unsupported_media_type: 415,
  too_many_requests: 429,
  server_error: { code: 500, status: "Internal Server Error" },
  unsupported_grant_type: 501,
  not_implemented: 501,
  temporarily_unavailable: 503,
};

export function sendResponse(
  res: Response,
  //success: boolean,
  code: number,
  message?: string,
  data?: [] | Record<string, unknown>,
  //errors?: ValidationError[],
): void {
  res.status(code).json({
    //success,
    code,
    message,
    data,
    //errors,
  });
}

export function responseHelper(res: any, next: NextFunction) {
  // For pure NodeJS support.
  if (res.json === undefined) {
    res.json = () => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify("need express"));
    };
  }

  res.respond = (message = "", data = null, codesHelper: { code: number; status: string }) => {
    res.statusCode = codesHelper.code;
    const response = {
      message,
      data,
    };
    res.json(response);
  };

  res.fail = (message: string, codesHelper: { code: number; status: string }) => {
    res.statusCode = codesHelper.code;
    const response = {
      success: false,
      code: codesHelper.code,
      status: codesHelper.status,
      message,
    };
    res.json(response);
  };

  res.respondOk = (message = "", data = null) => {
    res.statusCode = responseCodes.ok.code;
    const response: ResponseInterface = {
      message,
      data,
    };
    console.log(response);
    return res.json(response);
    //res.respond(message, data, responseCodes.ok);
  };

  res.respondCreated = (message = "", data = null) => {
    res.respond(message, data, responseCodes.created);
  };

  res.respondDeleted = (message = "", data = null) => {
    res.respond(message, data, responseCodes.deleted);
  };

  res.respondUpdated = (message = "", data = null) => {
    res.respond(message, data, responseCodes.updated);
  };

  res.respondNoContent = (message = "") => {
    res.respond(message, null, responseCodes.no_content);
  };

  res.failUnauthorized = (description = "Unauthorized! You need signin first.") => {
    res.fail(description, responseCodes.unauthorized);
  };

  res.failForbidden = (description = "Forbidden", code = null) => {
    res.fail(description, responseCodes.forbidden, code);
  };

  res.failNotFound = (description = "Not Found") => {
    res.fail(description, responseCodes.resource_not_found);
  };

  res.failValidationError = (errors: [], description = "Validation error.") => {
    res.statusCode = responseCodes.invalid_data.code;
    const response = {
      success: false,
      code: responseCodes.invalid_data.code,
      status: responseCodes.invalid_data.status,
      message: description,
      errors,
    };
    res.json(response);
  };

  res.failResourceExists = (description = "Conflict", code = null) => {
    res.fail(description, responseCodes.resource_exists, code);
  };

  res.failResourceGone = (description = "Gone", code = null) => {
    res.fail(description, responseCodes.resource_gone, code);
  };

  res.failTooManyRequests = (description = "Too Many Requests", code = null) => {
    res.fail(description, responseCodes.too_many_requests, code);
  };

  res.failServerError = (description = "Internal Server Error") => {
    res.fail(description, responseCodes.server_error);
  };

  res.failInvalidCredentials = (description = "Invalid Credentials") => {
    res.fail(description, responseCodes.invalid_credentials);
  };

  res.failSeeOther = (description = "Already use. Try others") => {
    res.fail(description, responseCodes.see_other);
  };

  res.failBadRequest = (description = "Data doesn't exist") => {
    res.fail(description, responseCodes.bad_request);
  };

  if (next !== null) next();
}
