<script setup lang="ts">
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { randomPoint } from '@turf/turf'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, Point } from 'geojson'
import { CollisionFilterExtension } from '@deck.gl/extensions'
import type { Color } from '@deck.gl/core'
import DglMapEvent from '~/components/ol/deckgl/dgl-map-event.vue'
import { mdiClose } from '@quasar/extras/mdi-v7'
import type { CoordinateExtractor } from '~/components/ol/deckgl/use.deckgl'

const points = randomPoint(1000000)
const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
points.features.forEach((f) => {
  f.properties.size = Math.floor(Math.random() * (30 - 10 + 1)) + 10
  f.properties.color = [randomBetween(0, 255), randomBetween(0, 255), randomBetween(0, 255)]
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
    getFillColor: (f) => [...(f.properties.color as [number, number, number]), 50],
    lineWidthMinPixels: 1,
    extensions: [new CollisionFilterExtension()],
    pickable: true
  })
}

const toCoordinate = ((f: Feature<Point>) => {
  return f.geometry.coordinates
}) as CoordinateExtractor
</script>

<template>
  <dgl-layer :layers="layers">
    <dgl-map-event name="click" :to-coordinate="toCoordinate">
      <template #default="{ coordinate, object, clear }">
        <ol-popper :coordinate="coordinate">
          <q-card>
            <q-bar class="q-pr-none">
              <div>Info</div>
              <q-space />
              <q-btn size="sm" flat :icon="mdiClose" round @click.stop="clear" />
            </q-bar>
            <q-card-section>
              <q-list separator>
                <q-item>
                  <q-item-section side>
                    <q-item-label>Размер</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ object?.['properties']?.['size'] }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section side>
                    <q-item-label>Цвет</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ object?.['properties']?.['color'] }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </ol-popper>
      </template>
    </dgl-map-event>
    <dgl-map-event name="pointermove" min-zoom="10">
      <template #default="{ coordinate, object }">
        <ol-popper-tooltip :coordinate="coordinate"> Кружок радиусом {{ object?.['properties']?.['size'] }} </ol-popper-tooltip>
      </template>
    </dgl-map-event>
  </dgl-layer>
</template>

<style scoped></style>
