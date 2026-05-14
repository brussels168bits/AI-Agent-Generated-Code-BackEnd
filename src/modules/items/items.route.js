import { Router } from 'express';
import { gatewayAuth } from '../../middlewares/gateway-auth.js';
import { validate } from '../../middlewares/validate.js';
import * as controller from './items.controller.js';
import {
  createBodySchema,
  deleteBodySchema,
  itemIdParamSchema,
  listQuerySchema,
  patchBodySchema,
  putBodySchema,
} from './items.validator.js';

const router = Router();

router.get('/', gatewayAuth, validate(listQuerySchema, 'query'), controller.list);
router.get('/:itemId', gatewayAuth, validate(itemIdParamSchema, 'params'), controller.detail);
router.post('/', gatewayAuth, validate(createBodySchema), controller.create);
router.put(
  '/:itemId',
  gatewayAuth,
  validate(itemIdParamSchema, 'params'),
  validate(putBodySchema),
  controller.replace,
);
router.patch(
  '/:itemId',
  gatewayAuth,
  validate(itemIdParamSchema, 'params'),
  validate(patchBodySchema),
  controller.patch,
);
router.delete(
  '/:itemId',
  gatewayAuth,
  validate(itemIdParamSchema, 'params'),
  validate(deleteBodySchema),
  controller.remove,
);

export default router;
