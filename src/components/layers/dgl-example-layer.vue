<script setup lang="ts">
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { randomPoint } from '@turf/turf'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature } from 'geojson'
import { CollisionFilterExtension } from '@deck.gl/extensions'
import type { Color } from '@deck.gl/core'
import DglMapEvent from '~/components/ol/deckgl/dgl-map-event.vue'

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
    getFillColor: (f) => [
      ...(f.properties.color as [number, number, number]),
      50
    ],
    lineWidthMinPixels: 1,
    extensions: [new CollisionFilterExtension()],
    pickable: true
  })
}
</script>

<template>
  <dgl-layer :layers="layers">
    <dgl-map-event
      name="click"
      :to-coordinate="(f) => f?.geometry?.coordinates"
    >
      <template #default="{ coordinate, object }">
        <ol-popper-tooltip :coordinate="coordinate">
          <q-list separator dark>
            <q-item>
              <q-item-section side>
                <q-item-label>Размер</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >{{ object?.['properties']?.['size'] }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side>
                <q-item-label>Цвет</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >{{ object?.['properties']?.['color'] }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </ol-popper-tooltip>
      </template>
    </dgl-map-event>
    <dgl-map-event name="pointermove">
      <template #default="{ coordinate, object }">
        <ol-popper-tooltip :coordinate="coordinate">
          Кружок радиусом {{ object?.['properties']?.['size'] }}
        </ol-popper-tooltip>
      </template>
    </dgl-map-event>
  </dgl-layer>
</template>

<style scoped></style>
