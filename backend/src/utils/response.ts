import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 400,
  errors?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
