import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal server error';

  logger.error({
    requestId: req.requestId,
    code,
    message,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    code,
    message,
    data: null,
    requestId: req.requestId,
  });
}
