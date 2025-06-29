<script setup lang="ts">
import { debounce } from 'lodash-es'
import useBaseClusterProps from '~/components/clusters/use.base.cluster.props'
import { ClusterLayer } from '~/components/ol/deckgl/cluster/cluster.layer'
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { ClusterTileLayer } from '~/components/ol/deckgl/cluster/cluster.tile.layer'
import type { GeoBoundingBox } from '@deck.gl/geo-layers'
import { ClusterMvtLayer } from '~/components/ol/deckgl/cluster/cluster.mvt.layer'

const CLIENT_SIDE = 'client'
const SERVER_SIDE = 'server'
const SERVER_SIDE_BBOX = 'server-bbox'
const SERVER_SIDE_MVT_ZXY = 'server-mvt'
const SERVER_SIDE_JSON_ZXY = 'server-json-tile'

type Source =
  | typeof CLIENT_SIDE
  | typeof SERVER_SIDE
  | typeof SERVER_SIDE_BBOX
  | typeof SERVER_SIDE_MVT_ZXY
  | typeof SERVER_SIDE_JSON_ZXY
  | typeof SERVER_SIDE_BBOX
const source = ref<Source>()
const clusterDistance = ref(40)
const loading = ref(0)
const debClusterDistance = ref(clusterDistance.value)
const setRadius = debounce((v) => (debClusterDistance.value = v), 350)
watch(clusterDistance, setRadius)

const radiusScale = ref(1)

const clusterZoom = ref({ min: 1, max: 10 })

const debClusterMaxZoom = ref(clusterZoom.value.max)
const debClusterMinZoom = ref(clusterZoom.value.min)
const setMinMaxClusterZom = debounce((v: { max: number; min: number }) => {
  debClusterMaxZoom.value = v.max
  debClusterMinZoom.value = v.min
}, 350)
watch(clusterZoom, setMinMaxClusterZom)

const items = [
  { label: 'Client side point generation', value: CLIENT_SIDE as Source },
  { label: 'Server side point generation', value: SERVER_SIDE as Source },
  { label: 'Server side json tiles by bbox', value: SERVER_SIDE_BBOX as Source },
  { label: 'Server side json ZXY tiles', value: SERVER_SIDE_JSON_ZXY as Source },
  { label: 'Server side mvt ZXY tiles', value: SERVER_SIDE_MVT_ZXY as Source }
]
const layerProps = computed(() => {
  const { layerProps } = useBaseClusterProps({
    radiusScale: radiusScale.value,
    clusterDistance: debClusterDistance.value,
    clusterMaxZoom: debClusterMaxZoom.value,
    clusterMinZoom: debClusterMinZoom.value
  })
  return layerProps.value
})
const data = computed(() => {
  switch (source.value) {
    case CLIENT_SIDE: {
      return useRandomPoints()
    }
    case SERVER_SIDE: {
      return '/api/features'
    }
  }
  return undefined
})

const layer = () => {
  switch (source.value) {
    case CLIENT_SIDE: {
      return new ClusterLayer(layerProps.value, {
        id: CLIENT_SIDE,
        data: data.value,
      })
    }
    case SERVER_SIDE: {
      return new ClusterLayer(layerProps.value, {
        id: SERVER_SIDE,
        data: data.value,
      })
    }
    case SERVER_SIDE_BBOX: {
      //@ts-expect-error unknown TS error
      return new ClusterTileLayer(layerProps.value, {
        id: SERVER_SIDE_BBOX,
        getTileData: function (props) {
          const { north, south, west, east } = props.bbox as GeoBoundingBox
          return $fetch(`/api/features?bbox=${west},${south},${east},${north}`)
        },
        onTileLoadStart: () => loading.value++,
        onTileLoad: () => loading.value--,
        onTileError: () => loading.value--,
        onViewportLoad: () => (loading.value = 0),
        //фиксируем загрузку тайлов на 3 зуме
        maxZoom: 3,
        minZoom: 3,
        extent: [-180, -90, 180, 90]
      })
    }
    case SERVER_SIDE_JSON_ZXY: {
      //@ts-expect-error unknown TS error
      return new ClusterTileLayer(layerProps.value, {
        id: SERVER_SIDE_JSON_ZXY,
        data: '/api/tiles/json/random-points/{z}/{x}/{y}',
        //фиксируем загрузку тайлов на 3 зуме
        maxZoom: 3,
        minZoom: 3,
        extent: [-180, -90, 180, 90],
        onTileLoadStart: () => loading.value++,
        onTileLoad: () => loading.value--,
        onTileError: () => loading.value--,
        onViewportLoad: () => (loading.value = 0),
      })
    }
    case SERVER_SIDE_MVT_ZXY: {
      //@ts-expect-error unknown TS error
      return new ClusterMvtLayer(layerProps.value, {
        id: SERVER_SIDE_MVT_ZXY,
        data: '/api/tiles/mvt/random-points/{z}/{x}/{y}',
        onTileLoadStart: () => loading.value++,
        onTileLoad: () => loading.value--,
        onTileError: () => loading.value--,
        onViewportLoad: () => (loading.value = 0),
        //фиксируем загрузку тайлов точность сильно теряется на маленьких зумах
        clusterMaxZoom: 10,
        maxZoom: 12,
        minZoom: 5,
        uniqueIdProperty: 'id',
        extent: [-180, -90, 180, 90]
      })
    }
  }
}
</script>

<template>
  <q-dialog :model-value="loading > 0" seamless position="top">
    <q-banner>
      <template #avatar>
        <q-spinner size="lg" />
      </template>
      Идет загрузка
    </q-banner>
  </q-dialog>
  loading:{{ loading }}
  <q-list>
    <q-item v-for="item in items" :key="item.value" clickable @click="source = item.value">
      <q-item-section>
        <q-item-label>{{ item.label }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-radio v-model="source" :val="item.value" />
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
        <q-item-label>Cluster distance:{{ clusterDistance }}</q-item-label>
        <q-item-label>
          <q-slider v-model="clusterDistance" :min="10" :max="150" :step="10" />
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
  <dgl-layer :id="source" :layers="layer" />
</template>

<style scoped></style>
