<script setup lang="ts">
import { useOlLayer, useOlMap } from '#imports'
import type { MapBrowserEvent } from 'ol'
import type { Coordinate } from 'ol/coordinate'
import type { FeatureLike } from 'ol/Feature'
import { type ProjectionLike, transform } from 'ol/proj'

const props = defineProps({
  handler: {
    type: Function as PropType<(evt: MapBrowserEvent) => boolean | undefined>,
    default: undefined
  },
  name: { type: String as PropType<'click' | 'pointermove'>, required: true },
  projection: {
    type: [Object, String] as PropType<ProjectionLike>,
    default: 'EPSG:4326'
  },
  maxZoom: { type: [Number, String], default: undefined },
  minZoom: { type: [Number, String], default: undefined }
})
const feature = defineModel('feature', {
  type: Object as PropType<FeatureLike>
})
const coordinate = defineModel('coordinate', {
  type: Array as PropType<Coordinate>
})

const event = defineModel('event', {
  type: Object as PropType<MapBrowserEvent>
})
const olLayer = useOlLayer()

const { isValidZoom } = useOlMap(
  (map) => {
    map.on(props.name, listener)
  },
  (map) => map.un(props.name, listener)
)

function clear() {
  feature.value = undefined
  coordinate.value = undefined
  event.value = undefined
}

function listener(evt: MapBrowserEvent) {
  if (!isValidZoom(props.minZoom, props.maxZoom)) {
    return clear()
  }
  let finded: FeatureLike | undefined = undefined
  evt.map.forEachFeatureAtPixel(
    evt.pixel,
    (f) => {
      finded = f
      if (props.handler) {
        return props.handler(evt)
      } else if (f) return true
    },
    {
      layerFilter: (l) => {
        return !olLayer?.value || olLayer?.value === l
      }
    }
  )
  if (finded) {
    feature.value = finded
    coordinate.value = transform(evt.coordinate, 'EPSG:3857', props.projection)
    event.value = evt
  } else {
    clear()
  }
}
</script>

<template>
  <slot name="default" :feature="feature" :coordinate="coordinate" :event="event" />
</template>

<style scoped></style>
