<script setup lang="ts">
import OlMap from '~/components/ol/ol-map.vue'
import TestPointLayer from '~/components/layers/test-point-layer.vue'
import { toLonLat } from 'ol/proj'
import MlMaptilerBright from '~/components/layers/ml-maptiler-bright.vue'
</script>

<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <client-only>
          <ol-map
            style="top: 0; bottom: 0; right: 0; left: 0; position: absolute"
          >
            <ml-maptiler-bright />
            <test-point-layer>
              <ol-map-event name="pointermove">
                <template #default="{ coordinate, event, feature }">
                  <ol-popper-tooltip
                    v-if="coordinate && event && feature"
                    :coordinate="coordinate"
                  >
                    <q-list dense dark>
                      <q-item>
                        <q-item-section>
                          <q-item-label>
                            name:{{ feature?.get('name') }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>
                            coordinate:{{ toLonLat(coordinate) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label>
                            pixel:{{ event?.pixel }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </ol-popper-tooltip>
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
