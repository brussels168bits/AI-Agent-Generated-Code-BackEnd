import { AppError } from '../../utils/app-error.js';
import * as repo from './items.repository.js';

function normalizePagination(query) {
  let page = Number(query.page ?? 1);
  let limit = Number(query.limit ?? 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;
  return { ...query, page, limit };
}

export async function list(query, userContext) {
  return repo.findAll(normalizePagination(query), userContext);
}

export async function findById(itemId, userContext) {
  return repo.findById(itemId, userContext);
}

export async function create(body, userContext) {
  return repo.create(body, userContext);
}

export async function replace(itemId, body, userContext) {
  const { upd_date: updDate, ...rest } = body;
  return repo.replace(itemId, new Date(updDate), rest, userContext);
}

export async function patch(itemId, body, userContext) {
  const { upd_date: updDate, ...patchFields } = body;
  const keys = Object.keys(patchFields);
  if (keys.length === 0) {
    throw new AppError(400, 'INVALID_PARAM', 'No fields to update');
  }
  return repo.patchPartial(itemId, new Date(updDate), patchFields, userContext);
}

export async function softDelete(itemId, originalUpdDate, userContext) {
  if (!originalUpdDate) throw new AppError(400, 'INVALID_PARAM', 'upd_date is required');
  return repo.softDelete(itemId, new Date(originalUpdDate), userContext);
}
