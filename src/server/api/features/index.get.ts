import { getRandomPointsFromTile } from '~/composables/points.repository'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')
  const features = await getRandomPointsFromTile(event)
  return features
})
