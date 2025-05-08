<script setup lang="ts">
import type { StyleSpecification } from 'maplibre-gl'
import type { PropType } from 'vue'
import { watch } from 'vue'
import type { Map as OlMap } from 'ol'
import MaplibreMap from '~/components/maplibre/ol/MaplibreMap'

const props = defineProps({
  style: {
    type: [String, Object] as PropType<string | StyleSpecification>,
    required: true
  },
  lang: { type: String, default: () => 'ru' }
})
const mlInteraction = new MaplibreMap({ style: props.style })
useOlMap(
  (m: OlMap) => m.addInteraction(mlInteraction),
  (m: OlMap) => m.removeInteraction(mlInteraction)
)
watch(
  () => props.style,
  (s) => (mlInteraction.style = s)
)
</script>

<template>
  <slot />
</template>
