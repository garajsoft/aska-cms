import { getPayload } from "payload";
import { sql } from "drizzle-orm";
import config from "../src/payload.config";

// Read-only diagnostic: confirms which database this script actually talks
// to, and whether the specific column production is erroring on exists.
async function main() {
  const payload = await getPayload({ config });
  const db = payload.db.drizzle;

  const ident = await db.execute(
    sql.raw(`SELECT current_database() AS db, inet_server_addr()::text AS addr, inet_server_port() AS port`)
  );
  payload.logger.info({ ident: ident.rows[0] }, "Connected to");

  const col = await db.execute(
    sql.raw(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'modules_id'`
    )
  );
  payload.logger.info(
    { exists: col.rows.length > 0 },
    "payload_locked_documents_rels.modules_id exists?"
  );

  const tableCount = await db.execute(
    sql.raw(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`)
  );
  payload.logger.info({ n: tableCount.rows[0] }, "Total public tables");

  const pageCount = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM pages`));
  payload.logger.info({ n: pageCount.rows[0] }, "Row count in pages");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
