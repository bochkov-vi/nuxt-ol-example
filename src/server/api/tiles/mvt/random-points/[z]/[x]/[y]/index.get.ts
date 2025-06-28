import { getRandomPointsFromTile, zxy } from '~/composables/points.repository'
import geojsonvt from 'geojson-vt'
import vtpbf from 'vt-pbf'
import { isEmpty } from 'lodash-es'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/vnd.mapbox-vector-tile')
  const data = await getRandomPointsFromTile(event)
  if (isEmpty(data?.features)) return
  const tileindex = geojsonvt({ features: data.features, type: 'FeatureCollection' }, {})
  const { z, x, y } = zxy(event)
  const tile = tileindex.getTile(z, x, y) as geojsonvt.Tile

  // pass in an object mapping layername -> tile object
  //@ts-expect-error uncknown ts error
  const buff = vtpbf.fromGeojsonVt({ random_points: tile })
  return buff
})
