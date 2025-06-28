import { getRandomPointsFromBbox } from '~/composables/points.repository'
import type { FeatureCollection } from 'geojson'


export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')
  const { features, count } = await getRandomPointsFromBbox(event)
  return { features, type: 'FeatureCollection', count } as FeatureCollection
})
