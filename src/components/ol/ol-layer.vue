<script setup lang="ts">
import type { Layer } from 'ol/layer'
import { type PropType, toValue } from 'vue'
import { toNumber } from 'lodash-es'
import { useOlMap } from '~/composables/use.ol'
import type { Map as OlMap } from 'ol'
import type BaseLayer from 'ol/layer/Base'

const props = defineProps({
  layer: { type: Object as PropType<Layer>, required: true },
  zIndex: { type: [String, Number], default: 1},
  visible: { type: Boolean, default: true }
})
const layer = toRefs(props).layer
layer?.value?.setZIndex(toNumber(props.zIndex))
layer?.value?.setVisible(props.visible)
provide('olLayer', layer)

function mount(map?: OlMap, layer?: BaseLayer) {
  if (map && layer) {
    map.addLayer(layer)
  }
}

function unmount(map?: OlMap, layer?: BaseLayer) {
  if (map && layer) {
    map.removeLayer(layer)
  }
}

useOlMap(
  (map) => {
    mount(map, toValue(layer))
  },
  (map) => unmount(map, toValue(layer))
)

watch(
  () => props.visible,
  (v) => props.layer?.setVisible(v)
)
watch(
  () => props.zIndex,
  (v) => props.layer?.setZIndex(toNumber(v))
)
</script>

<template>
  <slot />
</template>

<style scoped></style>
