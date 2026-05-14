import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid MongoDB ObjectId format',
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('active', 'inactive'),
  code: Joi.string().max(50).trim().allow(''),
  name: Joi.string().max(200).trim().allow(''),
});

export const itemIdParamSchema = Joi.object({
  itemId: objectId.required(),
});

export const createBodySchema = Joi.object({
  code: Joi.string().min(1).max(50).trim().required(),
  name: Joi.string().min(1).max(200).trim().required(),
  description: Joi.string().max(1000).allow(null).optional().default(null),
  status: Joi.string().valid('active', 'inactive').required(),
  tags: Joi.array().items(Joi.string()).optional().default([]),
});

export const putBodySchema = Joi.object({
  code: Joi.string().min(1).max(50).trim().required(),
  name: Joi.string().min(1).max(200).trim().required(),
  description: Joi.string().max(1000).allow(null).required(),
  status: Joi.string().valid('active', 'inactive').required(),
  tags: Joi.array().items(Joi.string()).required(),
  upd_date: Joi.date().iso().required(),
});

export const patchBodySchema = Joi.object({
  name: Joi.string().min(1).max(200).trim(),
  description: Joi.string().max(1000).allow(null),
  status: Joi.string().valid('active', 'inactive'),
  tags: Joi.array().items(Joi.string()),
  upd_date: Joi.date().iso().required(),
})
  .min(2)
  .messages({
    'object.min': 'No fields to update',
  });

export const deleteBodySchema = Joi.object({
  upd_date: Joi.date().iso().required(),
});
