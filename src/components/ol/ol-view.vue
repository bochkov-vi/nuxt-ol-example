<script setup lang="ts">
import type { Coordinate } from 'ol/coordinate'
import View from 'ol/View'
import { useOlMap } from '#imports'
import { fromLonLat } from 'ol/proj'

const center = defineModel('center', {
  type: Array as PropType<Coordinate>,
  default: [0, 0]
})
const view = new View({ center: fromLonLat(center.value), zoom: 2 })
useOlMap((map) => map.setView(view))
</script>

<template>
  <slot />
</template>

<style scoped></style>
