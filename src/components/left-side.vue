<script setup lang="ts">
import MlMaptilerBright from '~/components/layers/ml-maptiler-bright.vue'
import TestPointLayer from '~/components/layers/test-point-layer.vue'
import OsmLayer from '~/components/layers/osm-layer.vue'
import WebglOsmLayer from '~/components/layers/webgl-osm-layer.vue'
import DglExampleLayer from '~/components/layers/dgl-example-layer.vue'
import DglJsonTileLayer from '~/components/layers/dgl-json-tile-layer.vue'
import DglMvtTileLayer from '~/components/layers/dgl-mvt-tile-layer.vue'

const items = [
  { key: 'bright', label: 'Maplibre Vector Tiles Terrain' },
  {
    key: 'ol-point',
    label: 'Ol слой с точкой и тултипом для нее'
  },
  {
    key: 'ol-osm',
    label: 'Ol Raster Canvas Tile Layer OSM'
  },
  {
    key: 'ol-webgl-osm',
    label: 'Ol Raster WebGl Tile Layer OSM'
  },{
    key: 'dgl-points-example',
    label: 'Deckgl 1000000 points'
  },{
    key: 'dgl-json-tile-layer',
    label: 'Deckgl Json Tile Layer From API'
  },{
    key: 'dgl-mvt-tile-layer',
    label: 'Deckgl Mvt Tile Layer From API'
  }
]
const store = useMainStore()

function isEnabled(key: string) {
  return store.layers.includes(key)
}
</script>

<template>
  {{ store.layers }}
  <q-list>
    <q-item v-for="item in items" :key="item.key">
      <q-item-section>
        <q-item-label>{{ item.label }}</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-checkbox v-model="store.layers" :val="item.key" />
      </q-item-section>
    </q-item>
  </q-list>
  <ml-maptiler-bright v-if="isEnabled('bright')" />
  <test-point-layer v-if="isEnabled('ol-point')" />
  <osm-layer v-if="isEnabled('ol-osm')" />
  <webgl-osm-layer v-if="isEnabled('ol-webgl-osm')" />
  <dgl-example-layer v-if="isEnabled('dgl-points-example')" />
  <dgl-json-tile-layer v-if="isEnabled('dgl-json-tile-layer')"/>
  <dgl-mvt-tile-layer v-if="isEnabled('dgl-mvt-tile-layer')"/>
</template>

<style scoped></style>
