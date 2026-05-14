import { ObjectId } from 'mongodb';
import { getDatabase, getClient } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';
import { serializeDoc } from '../../utils/format.js';

const COL = 'x_items_brussels';
const LOG_COL = 'x_items_brussels_logs';
const PROG_CREATE = '/api/v1/items';
const PROG_ITEM = '/api/v1/items/:itemId';

function itemsCol() {
  return getDatabase().collection(COL);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tenantFilter(userContext) {
  return {
    ou_id: new ObjectId(userContext.ou_id),
    branch_id: new ObjectId(userContext.branch_id),
    is_deleted: false,
  };
}

function valuesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * @param {Record<string, unknown>} oldDoc
 * @param {Record<string, unknown>} newValues
 * @param {string[]} keys
 */
function buildChangedFields(oldDoc, newValues, keys) {
  const changed = {};
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(newValues, k)) continue;
    const oldVal = oldDoc[k];
    const newVal = newValues[k];
    if (!valuesEqual(oldVal, newVal)) {
      changed[k] = { old: oldVal ?? null, new: newVal };
    }
  }
  return Object.keys(changed).length ? changed : null;
}

function mapListRow(doc) {
  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    description: doc.description ?? null,
    status: doc.status,
    tags: doc.tags ?? [],
    upd_date: doc.upd_date instanceof Date ? doc.upd_date.toISOString() : doc.upd_date,
  };
}

function mapDetailRow(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    ...serializeDoc({
      code: doc.code,
      name: doc.name,
      description: doc.description ?? null,
      status: doc.status,
      tags: doc.tags ?? [],
      cr_by: doc.cr_by,
      cr_date: doc.cr_date,
      upd_by: doc.upd_by,
      upd_date: doc.upd_date,
    }),
  };
}

function isDuplicateKeyError(err) {
  return Boolean(err && err.code === 11000);
}

export async function findAll(query, userContext) {
  const { page, limit, status, code, name } = query;
  const filter = { ...tenantFilter(userContext) };
  if (status) filter.status = status;
  const trimmedCode = typeof code === 'string' ? code.trim() : '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (trimmedCode) {
    filter.code = { $regex: new RegExp(escapeRegex(trimmedCode), 'i') };
  }
  if (trimmedName) {
    filter.name = { $regex: new RegExp(escapeRegex(trimmedName), 'i') };
  }

  const projection = {
    _id: 1,
    code: 1,
    name: 1,
    description: 1,
    status: 1,
    tags: 1,
    upd_date: 1,
  };

  const [rows, total] = await Promise.all([
    itemsCol()
      .find(filter, { projection })
      .sort({ cr_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    itemsCol().countDocuments(filter),
  ]);

  return {
    data: rows.map((d) => mapListRow(d)),
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}

export async function findById(itemId, userContext) {
  const doc = await itemsCol().findOne(
    { _id: new ObjectId(itemId), ...tenantFilter(userContext) },
    {
      projection: {
        code: 1,
        name: 1,
        description: 1,
        status: 1,
        tags: 1,
        cr_by: 1,
        cr_date: 1,
        upd_by: 1,
        upd_date: 1,
      },
    },
  );
  return mapDetailRow(doc);
}

export async function create(body, userContext) {
  const client = getClient();
  const session = client.startSession();
  const db = getDatabase();
  const now = new Date();
  const ouId = new ObjectId(userContext.ou_id);
  const branchId = new ObjectId(userContext.branch_id);
  const userId = userContext.userId;

  const payload = {
    ou_id: ouId,
    branch_id: branchId,
    code: body.code,
    name: body.name,
    description: body.description ?? null,
    status: body.status,
    tags: body.tags ?? [],
    is_deleted: false,
    cr_by: userId,
    cr_date: now,
    cr_prog: PROG_CREATE,
    upd_by: userId,
    upd_date: now,
    upd_prog: PROG_CREATE,
  };

  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await db.collection(COL).findOne(
        {
          ou_id: ouId,
          branch_id: branchId,
          code: body.code,
        },
        { session },
      );
      if (existing) {
        throw new AppError(409, 'CONFLICT', 'Item code already exists');
      }

      let insertedId;
      try {
        const insertResult = await db.collection(COL).insertOne(payload, { session });
        insertedId = insertResult.insertedId;
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          throw new AppError(409, 'CONFLICT', 'Item code already exists');
        }
        throw err;
      }

      await db.collection(LOG_COL).insertOne(
        {
          ref_id: insertedId,
          ou_id: ouId,
          branch_id: branchId,
          action: 'INSERT',
          changed_fields: null,
          snapshot_data: { old: null, new: payload },
          cr_by: userId,
          cr_date: now,
          cr_prog: PROG_CREATE,
        },
        { session },
      );

      result = {
        id: insertedId.toString(),
        code: payload.code,
        name: payload.name,
        description: payload.description,
        status: payload.status,
        tags: payload.tags,
        cr_by: userId,
        cr_date: now.toISOString(),
        cr_prog: PROG_CREATE,
        upd_by: userId,
        upd_date: now.toISOString(),
        upd_prog: PROG_CREATE,
      };
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function replace(itemId, originalUpdDate, body, userContext) {
  const client = getClient();
  const session = client.startSession();
  const db = getDatabase();
  const now = new Date();
  const ouId = new ObjectId(userContext.ou_id);
  const branchId = new ObjectId(userContext.branch_id);
  const userId = userContext.userId;
  const _id = new ObjectId(itemId);

  try {
    let result;
    await session.withTransaction(async () => {
      const filter = { _id, ...tenantFilter(userContext), upd_date: originalUpdDate };
      const oldDoc = await db.collection(COL).findOne(filter, { session });
      if (!oldDoc) {
        throw new AppError(409, 'CONFLICT', 'Data not found or already modified');
      }

      const dup = await db.collection(COL).findOne(
        {
          ou_id: ouId,
          branch_id: branchId,
          code: body.code,
          _id: { $ne: _id },
        },
        { session },
      );
      if (dup) {
        throw new AppError(409, 'CONFLICT', 'Item code already exists');
      }

      const setPayload = {
        code: body.code,
        name: body.name,
        description: body.description,
        status: body.status,
        tags: body.tags,
        upd_by: userId,
        upd_date: now,
        upd_prog: PROG_ITEM,
      };

      try {
        await db.collection(COL).updateOne({ _id: oldDoc._id }, { $set: setPayload }, { session });
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          throw new AppError(409, 'CONFLICT', 'Item code already exists');
        }
        throw err;
      }

      const newValues = {
        code: setPayload.code,
        name: setPayload.name,
        description: setPayload.description,
        status: setPayload.status,
        tags: setPayload.tags,
      };
      const changedFields = buildChangedFields(oldDoc, newValues, [
        'code',
        'name',
        'description',
        'status',
        'tags',
      ]);
      const newDoc = { ...oldDoc, ...setPayload };

      await db.collection(LOG_COL).insertOne(
        {
          ref_id: oldDoc._id,
          ou_id: oldDoc.ou_id,
          branch_id: oldDoc.branch_id,
          action: 'UPDATE',
          changed_fields: changedFields,
          snapshot_data: { old: oldDoc, new: newDoc },
          cr_by: userId,
          cr_date: now,
          cr_prog: PROG_ITEM,
        },
        { session },
      );

      result = mapDetailRow(newDoc);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function patchPartial(itemId, originalUpdDate, patchFields, userContext) {
  const client = getClient();
  const session = client.startSession();
  const db = getDatabase();
  const now = new Date();
  const userId = userContext.userId;
  const _id = new ObjectId(itemId);

  const allowedKeys = ['name', 'description', 'status', 'tags'];
  const keysToSet = allowedKeys.filter((k) =>
    Object.prototype.hasOwnProperty.call(patchFields, k),
  );
  if (keysToSet.length === 0) {
    throw new AppError(400, 'INVALID_PARAM', 'No fields to update');
  }

  try {
    let result;
    await session.withTransaction(async () => {
      const filter = { _id, ...tenantFilter(userContext), upd_date: originalUpdDate };
      const oldDoc = await db.collection(COL).findOne(filter, { session });
      if (!oldDoc) {
        throw new AppError(409, 'CONFLICT', 'Data not found or already modified');
      }

      const setPayload = {};
      for (const k of keysToSet) {
        setPayload[k] = patchFields[k];
      }
      setPayload.upd_by = userId;
      setPayload.upd_date = now;
      setPayload.upd_prog = PROG_ITEM;

      await db.collection(COL).updateOne({ _id: oldDoc._id }, { $set: setPayload }, { session });

      const newDoc = { ...oldDoc, ...setPayload };
      const partialNew = {};
      for (const k of keysToSet) {
        partialNew[k] = patchFields[k];
      }
      const changedFields = buildChangedFields(oldDoc, partialNew, keysToSet);

      await db.collection(LOG_COL).insertOne(
        {
          ref_id: oldDoc._id,
          ou_id: oldDoc.ou_id,
          branch_id: oldDoc.branch_id,
          action: 'UPDATE',
          changed_fields: changedFields,
          snapshot_data: { old: oldDoc, new: newDoc },
          cr_by: userId,
          cr_date: now,
          cr_prog: PROG_ITEM,
        },
        { session },
      );

      result = mapDetailRow(newDoc);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function softDelete(itemId, originalUpdDate, userContext) {
  const client = getClient();
  const session = client.startSession();
  const db = getDatabase();
  const now = new Date();
  const userId = userContext.userId;
  const _id = new ObjectId(itemId);

  try {
    await session.withTransaction(async () => {
      const filter = { _id, ...tenantFilter(userContext), upd_date: originalUpdDate };
      const oldDoc = await db.collection(COL).findOne(filter, { session });
      if (!oldDoc) {
        throw new AppError(409, 'CONFLICT', 'Data not found or already modified');
      }

      const setPayload = {
        is_deleted: true,
        deleted_by: userId,
        deleted_date: now,
        deleted_prog: PROG_ITEM,
        upd_by: userId,
        upd_date: now,
        upd_prog: PROG_ITEM,
      };

      await db.collection(COL).updateOne({ _id: oldDoc._id }, { $set: setPayload }, { session });

      await db.collection(LOG_COL).insertOne(
        {
          ref_id: oldDoc._id,
          ou_id: oldDoc.ou_id,
          branch_id: oldDoc.branch_id,
          action: 'DELETE',
          changed_fields: null,
          snapshot_data: { old: oldDoc, new: null },
          cr_by: userId,
          cr_date: now,
          cr_prog: PROG_ITEM,
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}
