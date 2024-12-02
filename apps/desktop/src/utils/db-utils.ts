import { AnyColumn, SQL, GetColumnData, sql } from 'drizzle-orm';

export function createDbBulkUpdate<T extends AnyColumn, K = GetColumnData<T>>(
  targetColumn: T,
) {
  let isBuilt = false;

  const sqlChunks: SQL[] = [sql`(case`];
  const inputTargets: K[] = [];

  return {
    push(id: K, value: unknown) {
      if (isBuilt) return;

      sqlChunks.push(sql`when ${targetColumn} = ${id} then ${value}`);
      inputTargets.push(id);
    },
    build() {
      if (isBuilt) {
        return {
          targets: inputTargets,
          sql: sql.join(sqlChunks, sql.raw(' ')),
        };
      }

      sqlChunks.push(sql`end)`);
      isBuilt = true;

      return {
        targets: inputTargets,
        sql: sql.join(sqlChunks, sql.raw(' ')),
      };
    },
  };
}
