<script setup lang="ts">
import OlLayer from '~/components/ol/ol-layer.vue'
import Layer from 'ol/layer/WebGLTile.js'
import Source from 'ol/source/ImageTile.js'

const layer = new Layer({
  source: new Source({
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  })
})
</script>

<template>
  <ol-layer :layer="layer" />
</template>

<style scoped></style>
