<script setup lang="ts">
import type { Coordinate } from 'ol/coordinate';
import type { PickingInfo } from '@deck.gl/core';
import type { MjolnirGestureEvent, MjolnirPointerEvent } from 'mjolnir.js';
import { transform } from 'ol/proj';
import type { Feature, GeoJsonProperties } from 'geojson';
import { castArray, includes, some } from 'lodash-es';

import useDeckgl, {
  type CoordinateExtractor,
  FROM_EVENT,
  useProvideDeckLayerIds
} from '~/components/ol/deckgl/use.deckgl'
import type DeckglMap from '~/components/ol/deckgl/DeckglMap'

const props = defineProps({
  handler: {
    type: Function as PropType<(evt: PickingInfo, event: MjolnirGestureEvent | MjolnirPointerEvent) => boolean | undefined>,
    required: false,
    default: undefined,
  },
  name: { type: String as PropType<'click' | 'pointermove'>, required: true },
  layerId: {
    type: [Array, String] as PropType<Array<string> | string>,
    default: undefined,
  },
  toCoordinate: {
    type: Function as PropType<CoordinateExtractor>,
    default: FROM_EVENT,
  },
  maxZoom: { type: [Number, String], default: undefined },
  minZoom: { type: [Number, String], default: undefined },
});
const _feature = defineModel('feature', {
  type: Object as PropType<Feature | GeoJsonProperties | Record<string, unknown>>,
});
const _coordinate = defineModel('coordinate', {
  type: Array as PropType<Coordinate>,
});
const _pickingInfo = defineModel('pickingInfo', {
  type: Object as PropType<PickingInfo>,
});

const { deckMap } = useDeckgl();
const { olMap, isValidZoom } = useOlMap();
const providedIds = useProvideDeckLayerIds();

function clear() {
  _feature.value = undefined;
  _coordinate.value = undefined;
  _pickingInfo.value = undefined;
}

function eventHandler(info: PickingInfo, event: MjolnirGestureEvent | MjolnirPointerEvent) {
  if (!info.picked) {
    return clear();
  }
  if (!isValidZoom(props.minZoom, props.maxZoom)) {
    return clear();
  }
  if (props.layerId && !includes(castArray(props.layerId), info?.layer?.id)) {
    return clear();
  }
  if (providedIds && !some(castArray(toValue(providedIds)), (id) => id === info?.layer?.id)) {
    return clear();
  }

  if (props.handler) props.handler(info, event);
  _feature.value = info.object;
  if (info.picked && info.pixel) {
    if (props.toCoordinate) {
      _coordinate.value = props.toCoordinate(info);
    } else {
      const c = olMap?.value?.getCoordinateFromPixel(info.pixel);
      if (c) _coordinate.value = transform(c, 'EPSG:3857', 'EPSG:4326');
      else _coordinate.value = undefined;
    }
  } else {
    return clear();
  }
  _pickingInfo.value = info;
}

function onDeckMapChange(nv?: DeckglMap, ov?: DeckglMap) {
  if (props.name === 'click') {
    if (nv) {
      nv.onClick(eventHandler);
    }
    if (ov) {
      ov.unClick(eventHandler);
    }
  }
  if (props.name === 'pointermove') {
    if (nv) {
      nv.onHover(eventHandler);
    }
    if (ov) {
      ov.unHover(eventHandler);
    }
  }
}

watch(deckMap, onDeckMapChange);
onMounted(() => onDeckMapChange(deckMap.value));
onUnmounted(() => onDeckMapChange(undefined, deckMap.value));
</script>

<template>
  <slot
    name="default"
    :feature="_feature"
    :coordinate="_coordinate"
    :picking-info="_pickingInfo"
    :clear="clear"
  />
</template>

<style scoped></style>
