<script setup lang="ts">
import type { Coordinate } from 'ol/coordinate'
import View from 'ol/View'
import { useOlMap } from '#imports'
import { fromLonLat } from 'ol/proj'
import { toNumber } from 'lodash-es'

const center = defineModel('center', {
  type: Array as PropType<Coordinate>,
  default: [0, 0]
})
const zoom = defineModel('zoom', {
  type: [String, Number] as PropType<string | number>,
  default: 4
})
const view = new View({
  center: fromLonLat(center.value),
  zoom: toNumber(zoom.value)
})
const mapRef = ref()
useOlMap(
  (map) => {
    map.setView(view)
    map.setTarget(mapRef.value)
  },
  (map) => map.setTarget(undefined)
)
</script>

<template>
  <div
    ref="mapRef"
    style="top: 0; bottom: 0; right: 0; left: 0; position: absolute"
  >
    <slot />
  </div>
</template>

<style>
.ol-layer {
  pointer-events: none;
}
</style>
