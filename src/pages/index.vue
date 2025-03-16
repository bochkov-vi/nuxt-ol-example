<script setup lang="ts">
import OlMap from '~/components/ol/ol-map.vue'
import WebglOsmLayer from '~/components/layers/webgl-osm-layer.vue'
import TestPointLayer from '~/components/layers/test-point-layer.vue'
</script>

<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <client-only>
          <ol-map
            style="top: 0; bottom: 0; right: 0; left: 0; position: absolute"
          >
            <webgl-osm-layer />
            <test-point-layer>
              <ol-map-event name="pointermove">
                <template #default="{ coordinate }">
                  <ol-popper-tooltip :coordinate="coordinate" />
                </template>
              </ol-map-event>
            </test-point-layer>
          </ol-map>
        </client-only>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
