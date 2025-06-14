import { getRandomPointsFromTile, zxy } from '~/composables/points.repository'
import geojsonvt from 'geojson-vt'
import { featureCollection } from '@turf/turf'
import vtpbf from 'vt-pbf'
import { isEmpty } from 'lodash-es'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/vnd.mapbox-vector-tile')
  const data = await getRandomPointsFromTile(event)
  if (isEmpty(data)) return
  const tileindex = geojsonvt(featureCollection(data), {})
  const { z, x, y } = zxy(event)
  const tile = tileindex.getTile(z, x, y) as geojsonvt.Tile

  // pass in an object mapping layername -> tile object
  //@ts-expect-error uncknown ts error
  const buff = vtpbf.fromGeojsonVt({ random_points: tile })
  return buff
})
