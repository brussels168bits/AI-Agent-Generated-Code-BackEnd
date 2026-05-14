import { AppError } from '../utils/app-error.js';

/**
 * @param {import('joi').ObjectSchema} schema
 * @param {'body' | 'query' | 'params'} target
 */
export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(400, 'INVALID_PARAM', message));
    }

    req[target] = value;
    next();
  };
}
