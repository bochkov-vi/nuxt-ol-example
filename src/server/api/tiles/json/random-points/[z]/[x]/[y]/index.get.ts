import { getRandomPointsFromTile } from '~/composables/points.repository'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')
  const result = getRandomPointsFromTile(event)
  return result
})
