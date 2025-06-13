import type { Map } from 'ol';

import { castArray, compact, map } from 'lodash-es';

import type { Layer, PickingInfo } from '@deck.gl/core';
import type { Feature } from 'geojson';
import { booleanValid, centroid, getCoord } from '@turf/turf';
import DeckglMap, { type LayerGetter } from '~/components/ol/deckgl/DeckglMap'

const DECK_MAP_PROP = 'deck-map';
const DECK_LAYER_PROVIDED = 'deck-map';

export type CoordinateExtractor = <T>(o: PickingInfo<T>) => number[] | undefined;
export const FROM_CENTROID = ((o: PickingInfo<Feature>) => {
  if (o.object && booleanValid(o.object)) {
    return getCoord(centroid(o.object));
  }
}) as CoordinateExtractor;

export const FROM_EVENT = ((o: PickingInfo) => {
  return o.coordinate;
}) as CoordinateExtractor;

export default function () {
  const { olMap } = useOlMap();
  const deckMap = computed(() => getDeckMap(toValue(olMap)));
  return { deckMap: deckMap };
}

function getDeckMap(map?: Map) {
  if (map) {
    let deckglMap = map.get(DECK_MAP_PROP) as DeckglMap;
    if (!deckglMap) {
      deckglMap = markRaw(new DeckglMap({ zIndex: 1 }));
      map.set(DECK_MAP_PROP, deckglMap);
      map.addInteraction(deckglMap);
    }
    return deckglMap;
  }
  return undefined
}

export function useProvideDeckLayerIds() {
  const ids = inject<MaybeRefOrGetter<string[]> | undefined>(DECK_LAYER_PROVIDED, undefined);
  return computed(() => toValue(ids));
}

export function provideDeckLayerIds(layers: LayerGetter | Layer | Layer[]) {
  provide(
    DECK_LAYER_PROVIDED,
    computed(() => {
      const ls = map(compact(castArray(toValue(layers))), (l) => l.props?.id).filter((id) => !!id);
      return ls;
    }),
  );
}
