import { randomPoint } from '@turf/turf'
import type { FeatureCollection, Point } from 'geojson'

type PointProperties = { size: number; color: number[] }

export function useRandomPoints(count: number) {
  const points = randomPoint(count) as FeatureCollection<Point, PointProperties>
  points.features.forEach((f) => {
    f.properties.size = Math.floor(Math.random() * (30 - 10 + 1)) + 10
    f.properties.color = [randomBetween(0, 255), randomBetween(0, 255), randomBetween(0, 255)]
  })
  return points
}

const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
