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
const overlay = new Overlay({})
overlay.setPosition(props.coordinate)
const element = ref()
const coordinate = computed(() => {
  if (props.coordinate) {
    return transform(props.coordinate, props.projection, mapProjection.value)
  }
  return undefined
})

watch(coordinate, (v) => {
  overlay.setPosition(v)
})
watch(element, (v) => overlay.setElement(v))
useOlMap(
  (map) => map.addOverlay(overlay),
  (map) => map.removeOverlay(overlay)
)
</script>

<template>
  <div ref="element" v-bind="$attrs">
    <slot>Здесь стоит оверлей</slot>
  </div>
</template>

<style scoped></style>
