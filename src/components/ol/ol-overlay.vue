<script setup lang="ts">
import { Overlay } from 'ol'
import { useOlMap } from '#imports'
import type { Coordinate } from 'ol/coordinate'
import { getUserProjection, type ProjectionLike, transform } from 'ol/proj'

const props = defineProps({
  coordinate: { type: Array as PropType<Coordinate>, default: undefined },
  projection: {
    type: [Object, String] as PropType<ProjectionLike>,
    default: 'EPSG:4326'
  }
})
const { olMap } = useOlMap()
const mapProjection = computed(() => {
  if (olMap?.value && olMap.value.getView()) {
    return olMap.value.getView().getProjection()
  } else return getUserProjection() ?? 'EPSG:3857'
})
const element = ref()

const overlay = ref<Overlay>()

watch(overlay, (o) => {
  o?.setPosition(coordinate.value)
  o?.setElement(element.value)
})
const coordinate = computed(() => {
  if (props.coordinate) {
    return transform(props.coordinate, props.projection, mapProjection.value)
  }
  return undefined
})

watch(coordinate, (v) => {
  overlay.value?.setPosition(v)
})
watch(element, (v) => overlay.value?.setElement(v))
useOlMap(
  (map) => {
    const o = new Overlay({})
    overlay.value = o
    map.addOverlay(o)
  },
  (map) => {
    if (overlay.value) map.removeOverlay(overlay.value)
  }
)
</script>

<template>
  <div ref="element" v-bind="$attrs">
    <slot>Здесь стоит оверлей</slot>
  </div>
</template>

<style scoped></style>
