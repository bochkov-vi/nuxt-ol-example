import { DuckDBInstanceCache } from '@duckdb/node-api/lib/DuckDBInstanceCache'

export async function useDb() {
  const cache = new DuckDBInstanceCache()
  const instance = await cache.getOrCreateInstance(':memory:', {
    access_mode: 'READ_WRITE',
    max_memory: '2GB',
    threads: '1'
  })
  const db = await instance.connect()
  await db.run("INSTALL spatial; LOAD spatial;PRAGMA enable_logging;SET logging_storage = 'stdout';")
  return db
}
