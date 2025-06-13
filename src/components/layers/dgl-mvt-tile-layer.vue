<script setup lang="ts">
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { MVTLayer, TileLayer } from '@deck.gl/geo-layers'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature } from 'geojson'
import { CollisionFilterExtension } from '@deck.gl/extensions'

const layers = () => {
  return new MVTLayer({
    id: 'dgl-mvt-tile-layer',
    data: 'api/tiles/mvt/random-points/{z}/{x}/{y}',
    renderSubLayers(props) {
      return [
        new GeoJsonLayer(props, {
          id: `${props.id}-random-tile-points`,
          pointType: 'text+circle',
          getText: (f: Feature) => `${f.properties?.radius}`,
          getTextSize: 10,
          textSizeUnits: 'pixels',
          pointRadiusUnits: 'pixels',
          getPointRadius: (f: Feature) => f.properties?.radius,
          stroked: true,
          pointRadiusMinPixels: 5,
          filled: true,
          getLineColor: (f) => [f.properties.r, f.properties.g, f.properties.b],
          getFillColor: (f) => [f.properties.r, f.properties.g, f.properties.b, 50],
          lineWidthMinPixels: 1,
          extensions: [new CollisionFilterExtension()],
          pickable: true
        })
      ]
    }
  })
}
</script>

<template>
  <dgl-layer :layers="layers" />
</template>

<style scoped></style>
