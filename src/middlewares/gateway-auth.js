import { ObjectId } from 'mongodb';
import { AppError } from '../utils/app-error.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function isValidObjectIdString(value) {
  return typeof value === 'string' && OBJECT_ID_REGEX.test(value);
}

export function gatewayAuth(req, res, next) {
  const token = req.headers['x-gateway-token'];
  const expected = process.env.GATEWAY_TOKEN;

  if (!expected || token !== expected) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid gateway token'));
  }

  const ouId = req.headers['x-ou-id'];
  const branchId = req.headers['x-branch-id'];
  const userId = req.headers['x-user-id'];

  if (!isValidObjectIdString(ouId) || !isValidObjectIdString(branchId) || !isValidObjectIdString(userId)) {
    return next(new AppError(400, 'INVALID_HEADER', 'Missing required headers'));
  }

  try {
    req.user = {
      ou_id: new ObjectId(ouId).toString(),
      branch_id: new ObjectId(branchId).toString(),
      userId: new ObjectId(userId).toString(),
    };
  } catch {
    return next(new AppError(400, 'INVALID_HEADER', 'Missing required headers'));
  }

  next();
}
