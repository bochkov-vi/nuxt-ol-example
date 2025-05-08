<script setup lang="ts">
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'

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
  <ol-layer :layer="layer">
    <slot name="default" />
  </ol-layer>
</template>

<style scoped></style>
