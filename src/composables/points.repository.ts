import type { H3Event } from 'h3'
import { isEmpty, split, toNumber, toString } from 'lodash-es'
import { tileToBBOX } from '~/composables/tile.to.bbox'
import type { Feature } from 'geojson'
import destr from 'destr'
import type { DuckDBConnection, DuckDBValue } from '@duckdb/node-api'
import { featureCollection } from '@turf/turf'

export async function getRandomPointsFromTile(event: H3Event) {
  const { z, x, y } = zxy(event)
  const bbox = tileToBBOX(z, x, y)
  const db = event.context.db

  const features = getRandomPoints(db, bbox)
  return features
}

export function zxy(event: H3Event) {
  const z = toNumber(getRouterParam(event, 'z'))
  const x = toNumber(getRouterParam(event, 'x'))
  const y = toNumber(getRouterParam(event, 'y'))
  return { z, x, y }
}

export async function getRandomPointsFromBbox(event: H3Event) {
  const { bbox } = getQuery(event)
  const db = event.context.db

  const features = await getRandomPoints(db, split(toString(bbox), ',').map(toNumber))
  return featureCollection(features)
}

export async function getRandomPoints(db: DuckDBConnection, bbox?: number[]) {
  if (!bbox || isEmpty(bbox) || bbox.length !== 4 || bbox.some(n=>!isFinite(n))) {
    bbox = [-180, -85, 180, 85]
  }

  const reader = await db.runAndReadAll(
    `SELECT CAST({id:id,type: 'Feature',geometry: ST_AsGeoJSON(geom),properties: {radius: radius,r:r,g:g,b:b}} AS JSON)::JSON AS feature
                         FROM random_points
                         WHERE ST_Intersects(ST_MakeEnvelope($1, $2, $3,$4), geom)`,
    bbox
  )

  const features = Array<Feature>()
  reader.getRows().forEach((row: DuckDBValue[]) => features.push(destr<Feature>(row[0])))
  return features
}
