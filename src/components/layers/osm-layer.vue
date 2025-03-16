<script setup lang="ts">
import OlLayer from '~/components/ol/ol-layer.vue'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
const layer = new TileLayer({
  source: new OSM(),
  zIndex: 0,
  properties: {
    name: 'osm',
  },
})
</script>

<template>
  <ol-layer :layer="layer" />
</template>

<style scoped></style>
