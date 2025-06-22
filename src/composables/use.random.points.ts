import { randomPoint } from '@turf/turf'
import type { FeatureCollection, Point } from 'geojson'

export type PointProperties = { size: number; r: number; g: number; b: number }

export function useRandomPoints(count: number) {
  const points = randomPoint(count) as FeatureCollection<Point, PointProperties>
  points.features.forEach((f) => {
    f.properties.size = Math.floor(Math.random() * (30 - 10 + 1)) + 10
    f.properties.r = randomBetween(0, 255)
    f.properties.g = randomBetween(0, 255)
    f.properties.b = randomBetween(0, 255)
  })
  return points
}

const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
