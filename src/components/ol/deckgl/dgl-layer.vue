<script setup lang="ts">
import type { LayerGetter } from '~/components/ol/deckgl/DeckglMap'
import useDeckgl, { provideDeckLayerIds } from '~/components/ol/deckgl/use.deckgl'
import { toNumber } from 'lodash-es'

const props = defineProps({
  layers: { type: Function as PropType<LayerGetter>, required: true },
  zIndex: { type: [Number, String], default: 0 },
  keyString: { type: String, default: undefined }
})
const { deckMap } = useDeckgl()
const keyOfRenders = ref(props.keyString)
provideDeckLayerIds(props.layers)
onMounted(() => {
  keyOfRenders.value = deckMap.value?.addRenders(
    props.layers,
    toNumber(props.zIndex),
    keyOfRenders.value
  )
})
onUnmounted(() => {
  deckMap.value?.removeRenders(keyOfRenders.value)
})
</script>

<template>
  <slot />
</template>

<style scoped></style>
