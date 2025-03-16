<script setup lang="ts">
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'

const layer = new Vector({
  source: new VectorSource({ features: [new Feature(new Point([0, 0]))] })
})
</script>

<template>
  <ol-layer :layer="layer" >
    <slot name="default"/>
  </ol-layer>
</template>

<style scoped></style>
