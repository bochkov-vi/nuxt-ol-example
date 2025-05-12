<script setup lang="ts">
import DglLayer from '~/components/deckgl/dgl-layer.vue'
import { randomPoint } from '@turf/turf'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature } from 'geojson'
import { CollisionFilterExtension } from '@deck.gl/extensions'

const points = randomPoint(1000000)
points.features.forEach(
  (f) => (f.properties.size = Math.floor(Math.random() * (30 - 10 + 1)) + 10)
)
const layers = () => {
  return new GeoJsonLayer({
    id: 'random-points',
    data: points,
    pointType: 'text+circle',
    getText: (f: Feature) => `${f.properties?.size}`,
    getTextSize: 10,
    textSizeUnits: 'pixels',
    pointRadiusUnits: 'pixels',
    getPointRadius: (f: Feature) => f.properties?.size,
    stroked: true,
    pointRadiusMinPixels: 5,
    filled: false,
    getLineColor: () => [
      randomBetween(0, 255),
      randomBetween(0, 255),
      randomBetween(0, 255)
    ],
    lineWidthMinPixels: 1,
    extensions: [new CollisionFilterExtension()],
  })
}
const randomBetween = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))
</script>

<template>
  <dgl-layer :layers="layers" />
</template>

<style scoped></style>
