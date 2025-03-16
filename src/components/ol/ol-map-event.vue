<script setup lang="ts">
import { useOlLayer, useOlMap } from '#imports'
import type { MapBrowserEvent } from 'ol'
import type { Coordinate } from 'ol/coordinate'
import type { FeatureLike } from 'ol/Feature'

const props = defineProps({
  handler: {
    type: Function as PropType<
      (evt: MapBrowserEvent<UIEvent>) => boolean | undefined
    >,
    default: undefined
  },
  name: { type: String as PropType<'click' | 'pointermove'>, required: true }
})
const feature = defineModel('feature', {
  type: Object as PropType<FeatureLike>
})
const coordinate = defineModel('coordinate', {
  type: Array as PropType<Coordinate>
})

const event = defineModel('event', {
  type: Object as PropType<MapBrowserEvent<UIEvent>>
})
const olLayer = useOlLayer()

function listener(evt: MapBrowserEvent<UIEvent>) {
  let finded: FeatureLike | undefined = undefined
  evt.map.forEachFeatureAtPixel(
    evt.pixel,
    (f) => {
      finded = f
      coordinate.value = evt.coordinate
      event.value = evt
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
    coordinate.value = evt.coordinate
    event.value = evt
  } else {
    feature.value = undefined
    coordinate.value = undefined
    event.value = undefined
  }
}

useOlMap(
  (map) => {
    map.on(props.name, listener)
  },
  (map) => map.un(props.name, listener)
)
</script>

<template>
  <slot
    name="default"
    :feature="feature"
    :coordinate="coordinate"
    :event="event"
  />
</template>

<style scoped></style>
