<script setup lang="ts">
import { toNumber } from 'lodash-es';
import type { LayerGetter } from '~/components/ol/deckgl/DeckglMap'
import useDeckgl, { provideDeckLayerIds } from '~/components/ol/deckgl/use.deckgl'


const props = defineProps({
  layers: { type: [Function] as PropType<LayerGetter>, required: true },
  zIndex: { type: [Number, String], default: 0 },
  id: { type: String, default: undefined },
});
const { deckMap } = useDeckgl();
const keyOfRenders = ref(props.id);

provideDeckLayerIds(props.layers);

watch(props.layers, () => {
  deckMap.value?.changed();
});

watch(deckMap, (map, old) => {
  if (keyOfRenders.value && old) {
    deckMap.value?.removeRenders(keyOfRenders.value);
  }
  if (map) {
    keyOfRenders.value = deckMap.value?.addRenders(props.layers, toNumber(props.zIndex), keyOfRenders.value);
  }
});

onMounted(() => {
  keyOfRenders.value = deckMap.value?.addRenders(props.layers, toNumber(props.zIndex), keyOfRenders.value);
});
onUnmounted(() => {
  deckMap.value?.removeRenders(keyOfRenders.value);
});
</script>

<template>
  <slot />
</template>

<style scoped></style>
