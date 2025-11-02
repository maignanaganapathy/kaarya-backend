export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    errors?: any[],
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string = 'Bad Request', errors?: any[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(409, message);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message);
  }
}
