import { useDb } from '~/composables/use.db'

export default defineNitroPlugin(async (app) => {
  const runtimeConfig = useRuntimeConfig()
  const pointCount = runtimeConfig.public.POINT_COUNT
  const db = await useDb()
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
FROM ST_GeneratePoints({min_x: -180, min_y:-85, max_x:180, max_y:85}::BOX_2D, ${pointCount});`)
  app.hooks.hook('close', async () => {
    db.closeSync()
  })
  app.hooks.hook('request', async (e) => {
    e.context.db = db
  })
})
