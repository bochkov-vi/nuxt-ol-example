<script setup lang="ts">
import type { Coordinate } from 'ol/coordinate'
import useDeckgl from '~/components/ol/deckgl/use.deckgl'
import type DeckglMap from '~/components/ol/deckgl/DeckglMap'
import type { PickingInfo } from '@deck.gl/core'
import type { MjolnirGestureEvent, MjolnirPointerEvent } from 'mjolnir.js'
import { transform } from 'ol/proj'
import type { Feature, GeoJsonProperties } from 'geojson'

const props = defineProps({
  handler: {
    type: Function as PropType<
      (
        evt: PickingInfo,
        event: MjolnirGestureEvent | MjolnirPointerEvent
      ) => boolean | undefined
    >,
    required: false,
    default: undefined
  },
  name: { type: String as PropType<'click' | 'pointermove'>, required: true },
  layerId: {
    type: [Array, String] as PropType<Array<string> | string>,
    default: undefined
  },
  toCoordinate: {
    type: Function as PropType<
      (o: Feature | GeoJsonProperties | unknown) => number[]
    >,
    default: undefined
  }
})
const object = defineModel('object', {
  type: Object as PropType<Feature | GeoJsonProperties>
})
const coordinate = defineModel('coordinate', {
  type: Array as PropType<Coordinate>
})
const pick = defineModel('pick', {
  type: Object as PropType<PickingInfo>
})

const { deckMap } = useDeckgl()
const { olMap } = useOlMap()

function eventHandler(
  info: PickingInfo,
  event: MjolnirGestureEvent | MjolnirPointerEvent
) {
  if (props.handler) props.handler(info, event)
  object.value = info.object
  if (info.picked && info.pixel) {
    if (props.toCoordinate) {
      coordinate.value = props.toCoordinate(info.object)
    } else {
      const c = olMap?.value?.getCoordinateFromPixel(info.pixel)
      if (c) coordinate.value = transform(c, 'EPSG:3857', 'EPSG:4326')
      else coordinate.value = undefined
    }
  } else {
    coordinate.value = undefined
  }
  pick.value = info
}

function onDeckMapChange(nv?: DeckglMap, ov?: DeckglMap) {
  if (props.name === 'click') {
    if (nv) {
      nv.onClick(eventHandler)
    }
    if (ov) {
      ov.unClick(eventHandler)
    }
  }
  if (props.name === 'pointermove') {
    if (nv) {
      nv.onHover(eventHandler)
    }
    if (ov) {
      ov.unHover(eventHandler)
    }
  }
}

watch(deckMap, onDeckMapChange)
onMounted(() => onDeckMapChange(deckMap.value))
onUnmounted(() => onDeckMapChange(undefined, deckMap.value))
</script>

<template>
  <slot name="default" :object="object" :coordinate="coordinate" :pick="pick" />
</template>

<style scoped></style>
