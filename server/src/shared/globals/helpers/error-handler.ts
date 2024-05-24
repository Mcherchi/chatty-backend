import { StatusCodes } from 'http-status-codes';

export interface IErrorPayload {
  message: string;
  statusCode: number;
  status: string;
  serializeErrors(): IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error implements IErrorPayload {
  abstract statusCode: number;
  abstract status: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors(): IError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = 'Bad Request';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = 'Not Found';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'Not Authorized';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}

export class FileTooLargeError extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = 'File Too Large';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, FileTooLargeError.prototype);
  }
}

export class ServerError extends CustomError {
  statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  status = 'Server Error';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
