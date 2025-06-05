<script setup lang="ts">
import DglLayer from '~/components/deckgl/dgl-layer.vue'
import { randomPoint } from '@turf/turf'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature } from 'geojson'
import { CollisionFilterExtension } from '@deck.gl/extensions'
import type { Color } from '@deck.gl/core'

const points = randomPoint(1000000)
const randomBetween = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))
points.features.forEach((f) => {
  f.properties.size = Math.floor(Math.random() * (30 - 10 + 1)) + 10
  f.properties.color = [
    randomBetween(0, 255),
    randomBetween(0, 255),
    randomBetween(0, 255)
  ]
})
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
    filled: true,
    getLineColor: (f) => f.properties.color as Color,
    getFillColor: (f) => [...(f.properties.color as [number,number,number]),50],
    lineWidthMinPixels: 1,
    extensions: [new CollisionFilterExtension()]
  })
}

</script>

<template>
  <dgl-layer :layers="layers" />
</template>

<style scoped></style>
