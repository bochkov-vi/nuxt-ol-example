<script setup lang="ts">
import type { LayerGetter } from '~/components/deckgl/ol/DeckglMap'
import useDeckgl from '~/components/deckgl/use.deckgl'
import { toNumber } from 'lodash-es'

const props = defineProps({
  layers: { type: Function as PropType<LayerGetter>, required: true },
  zIndex: { type: [Number, String], default: 0 },
  keyString: { type: String, default: undefined }
})
const { deckMap } = useDeckgl()
const keyOfRenders = ref(props.keyString)
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
