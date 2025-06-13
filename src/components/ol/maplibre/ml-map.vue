<script setup lang="ts">
import type { StyleSpecification } from 'maplibre-gl';
import type { PropType } from 'vue';
import { watch } from 'vue';
import { useOlMap } from '#imports';
import MaplibreMap from '~/components/ol/maplibre/MaplibreMap'

const props = defineProps({
  mapStyle: {
    type: [String, Object] as PropType<string | StyleSpecification>,
    required: true,
  },
  lang: { type: String, default: () => 'ru' },
});
const mlInteraction = new MaplibreMap({ style: props.mapStyle });
useOlMap(
  (m) => m.addInteraction(mlInteraction),
  (m) => m.removeInteraction(mlInteraction),
);
watch(
  () => props.mapStyle,
  (s) => (mlInteraction.style = s),
);
</script>

<template>
  <slot />
</template>
