import { DuckDBInstance } from '@duckdb/node-api'
import { DuckDBInstanceCache } from '@duckdb/node-api/lib/DuckDBInstanceCache'

export default defineNitroPlugin(async (app) => {
  const cache = new DuckDBInstanceCache();
  const instance = await cache.getOrCreateInstance('db.duckdb', {
    access_mode: 'READ_WRITE',
    max_memory: '512MB',
    threads: '4'
  })
  const db = await instance.connect()
  await db.run('INSTALL spatial; LOAD spatial;PRAGMA enable_logging;SET logging_storage = \'stdout\';')
  await db.run(`CREATE OR REPLACE SEQUENCE random_points_d START 1;
CREATE OR REPLACE TABLE random_points(
    id BIGINT DEFAULT nextval('random_points_d') PRIMARY KEY,
    radius INTEGER NOT NULL,
    r INTEGER NOT NULL,
    g INTEGER NOT NULL,
    b INTEGER NOT NULL,
    geom GEOMETRY
);
CREATE INDEX random_points_geom ON random_points USING RTREE(geom);
INSERT INTO random_points (geom, radius,r,g,b)
SELECT point, round(((random() * 30) + 10)),
       round((random() * 255) ),round((random() * 255) ),round((random() * 255) ),
FROM ST_GeneratePoints({min_x: -180, min_y:-85, max_x:180, max_y:85}::BOX_2D, 1000000);`)
  app.hooks.hook('close', async () => {
    db.closeSync()
    instance.closeSync()
  })
  app.hooks.hook('request', async (e) => {
    e.context.db = db
  })
})
