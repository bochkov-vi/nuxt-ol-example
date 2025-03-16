<script setup lang="ts">
import { Overlay } from 'ol'
import { useOlMap } from '#imports'
import type { Coordinate } from 'ol/coordinate'

const props = defineProps({
  coordinate: { type: Array as PropType<Coordinate>, default: undefined }
})
const overlay = new Overlay({})
overlay.setPosition(props.coordinate)
const element = ref()
watch(
  () => props.coordinate,
  (v) => overlay.setPosition(v)
)
watch(element, (v) => overlay.setElement(v))
useOlMap(
  (map) => map.addOverlay(overlay),
  (map) => map.removeOverlay(overlay)
)
</script>

<template>
  <div ref="element" v-bind="$attrs">
    <slot>Здесь стоит оверлей</slot>
  </div>
</template>

<style scoped></style>
