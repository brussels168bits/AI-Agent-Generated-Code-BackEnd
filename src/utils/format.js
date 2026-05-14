import { Decimal128, ObjectId } from 'mongodb';

/**
 * Serialize MongoDB document fields for JSON responses.
 */
export function serializeDoc(doc) {
  if (!doc) return null;

  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') continue;
    if (value instanceof Decimal128) {
      result[key] = value.toString();
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (value instanceof ObjectId) {
      result[key] = value.toString();
    } else {
      result[key] = value;
    }
  }
  return result;
}
