import 'dotenv/config';
import { connectDatabase, closeDatabase, getDatabase } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';

async function main() {
  await connectDatabase();
  const db = getDatabase();

  await db.collection('x_items_brussels').createIndex(
    { ou_id: 1, branch_id: 1, code: 1 },
    { name: 'uk_ou_branch_code', unique: true },
  );

  await db.collection('x_items_brussels').createIndex(
    { ou_id: 1, branch_id: 1, is_deleted: 1, status: 1, cr_date: -1 },
    { name: 'idx_ou_branch_deleted_status_date' },
  );

  logger.info('[db:x_items_brussels-indexes] Indexes ensured for items');
  await closeDatabase();
}

main().catch((err) => {
  logger.error({ err }, '[db:items-indexes] Failed');
  process.exit(1);
});
