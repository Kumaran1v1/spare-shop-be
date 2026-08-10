import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Error Handler Caught:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    sendError(res, 'Validation Error', 422, errors);
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    sendError(res, `Duplicate field value entered for '${field}'. Please use another value.`, 409);
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, `Invalid ID format: ${err.value}`, 400);
    return;
  }

  sendError(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? [err.stack] : undefined
  );
};
