<script setup lang="ts">
import { ClusterLayer } from '~/components/ol/deckgl/cluster/cluster.layer'
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import { debounce } from 'lodash-es'
import DglMapEvent from '~/components/ol/deckgl/dgl-map-event.vue'

type Source = 'client' | 'server-tile-json' | 'server-single-json' | 'server-mvt'
const source = ref<Source>('client')
const clusterRadius = ref(40)
const radius = ref(clusterRadius.value)
const setRadius = debounce((v) => (radius.value = v), 250)
watch(clusterRadius, setRadius)

const radiusScale = ref(1)

const clusterZoom = ref({ min: 1, max: 16 })
const zoom = ref(clusterZoom.value)
const setZoom = debounce((v) => (zoom.value = v), 250)
watch(clusterZoom, setZoom)
const data = computed(() => {
  switch (source.value) {
    case 'client':
      return useRandomPoints(100000).features
    default:
      return 'api/features'
  }
})
const layer = () => {
  return new ClusterLayer({
    id: 'cluster-layer-test',
    data: data.value,
    clusterMaxZoom: zoom.value.max,
    clusterMinZoom: zoom.value.min,
    clusterRadius: radius.value,
    updateTriggers: { radiusScale: radiusScale.value },
    pickable: true,
    renderClusterLayers(props) {
      return [
        new ScatterplotLayer({
          id: `${props.id}-cluster-circles`,
          data: props.data,
          radiusUnits: 'pixels',
          getRadius: (f) => {
            const radius = 15 + Math.log(f.properties.point_count ?? 1) * radiusScale.value
            return radius
          },
          getPosition: (p) => {
            if (p.properties.cluster) return p.geometry.coordinates
          },
          stroked: true,
          radiusMinPixels: 5,
          filled: true,
          pickable: true,
          getLineColor: [0, 0, 255],
          getFillColor: [0, 0, 255, 50],
          lineWidthMinPixels: 1
        }),
        new TextLayer({
          id: `${props.id}-cluster-labels`,
          data: props.data,
          getText: (f) => {
            if (f.properties.point_count) return `${f.properties?.point_count}`
            return ''
          },
          getPosition: (p) => {
            if (p.properties.cluster) return p.geometry.coordinates
          },
          getSize: 10,
          sizeUnits: 'pixels'
        }),
        new IconLayer({
          id: `${props.id}-point-icons`,
          data: props.data,
          getPosition: (p) => {
            if (!p.properties.cluster) {
              return p.geometry.coordinates
            }
          },
          iconAtlas: 'deck-icon/marker.svg',
          iconMapping: 'deck-icon/marker.json',
          getIcon: () => 'marker',
          getSize: 20,
          getColor: (f) => {
            return [f.properties.r, f.properties.g, f.properties.b]
          },
          pickable: true
        })
      ]
    }
  })
}
</script>

<template>
  <q-list>
    <q-item clickable @click="source = 'client'">
      <q-item-section>
        <q-item-label>Client side point generation</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-radio v-model="source" size="dm" val="client" />
      </q-item-section>
    </q-item>
    <q-item clickable @click="source = 'server-single-json'">
      <q-item-section>
        <q-item-label>Server side point generation</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-radio v-model="source" val="server-single-json" />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Max cluster zoom:{{ clusterZoom.max }}</q-item-label>
        <q-item-label>Min cluster zoom:{{ clusterZoom.min }}</q-item-label>
        <q-item-label>
          <q-range v-model="clusterZoom" :min="1" :max="16" />
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Cluster size:{{ clusterRadius }}</q-item-label>
        <q-item-label>
          <q-slider v-model="clusterRadius" :min="10" :max="80" />
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Cluster circle radius scale:{{ radiusScale }}</q-item-label>
        <q-item-label>
          <q-slider v-model="radiusScale" :min="0.1" :max="50" :step="0.1" />
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
  <dgl-layer :layers="layer">
    <dgl-map-event name="click">
      <template #default="{ coordinate, pickingInfo, clear }">
        <ol-popper :coordinate="coordinate">
          <q-banner>
            <q-list v-if="pickingInfo?.objects">
              <q-item v-for="item in pickingInfo.objects">
                <q-item-section>
                  <q-item-label>{{ item }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <template #action>
              <q-btn @click="clear">Закрыть</q-btn>
            </template>
          </q-banner>
        </ol-popper>
      </template>
    </dgl-map-event>
  </dgl-layer>
</template>

<style scoped></style>
