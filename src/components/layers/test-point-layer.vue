<script setup lang="ts">
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { toLonLat } from 'ol/proj'

const layer = new Vector({
  style: { 'circle-radius': 20, 'circle-fill-color': 'rgba(255,125,125,0.5)' },
  source: new VectorSource({
    features: [
      new Feature({ geometry: new Point([0, 0]), name: 'Простая Точка' })
    ]
  })
})
</script>

<template>
  <ol-layer :layer="layer" z-index="10">
    <ol-map-event name="pointermove" min-zoom="4">
      <template #default="{ coordinate, event, feature }">
        <ol-popper-tooltip
          v-if="coordinate && event && feature"
          :coordinate="coordinate"
        >
          <q-list dense dark>
            <q-item>
              <q-item-section>
                <q-item-label> name:{{ feature?.get('name') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>
                  coordinate:{{ toLonLat(coordinate) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label> pixel:{{ event?.pixel }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </ol-popper-tooltip>
      </template>
    </ol-map-event>
  </ol-layer>
</template>

<style scoped></style>
