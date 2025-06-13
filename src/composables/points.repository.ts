import type { H3Event } from 'h3'
import { toNumber } from 'lodash-es'
import { tileToBBOX } from '~/composables/tile.to.bbox'
import type { Feature } from 'geojson'
import destr from 'destr'

export async function getRandomPointsFromTile(event: H3Event) {
  const {z,x,y} = zxy(event)
  const { east, west, south, north } = tileToBBOX(z, x, y)
  const db = event.context.db
  const reader = await db.runAndReadAll(
    `SELECT CAST({id:id,type: 'Feature',geometry: ST_AsGeoJSON(geom),properties: {radius: radius,r:r,g:g,b:b}} AS JSON)::JSON AS feature
                         FROM random_points
                         WHERE ST_Intersects(ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}), geom)`
  )
  const result = Array<Feature>()
  reader.getRows().forEach((row: string[]) => result.push(destr<Feature>(row[0])))
  return result
}

export function zxy(event: H3Event) {
  const z = toNumber(getRouterParam(event, 'z'))
  const x = toNumber(getRouterParam(event, 'x'))
  const y = toNumber(getRouterParam(event, 'y'))
  return { z, x, y }
}
