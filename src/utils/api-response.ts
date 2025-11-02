import { Response } from 'express';

interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  stack?: string;
}

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data?: any,
    statusCode: number = 200
  ): Response {
    const response: SuccessResponse = {
      success: true,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any[],
    stack?: string
  ): Response {
    const response: ErrorResponse = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development' && stack) {
      response.stack = stack;
    }

    return res.status(statusCode).json(response);
  }

  static created(res: Response, message: string, data?: any): Response {
    return this.success(res, message, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
