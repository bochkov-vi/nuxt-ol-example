import type { Map } from 'ol'
import type { LayerGetter } from '~/components/ol/deckgl/DeckglMap'
import DeckglMap from '~/components/ol/deckgl/DeckglMap'
import { castArray, compact, map } from 'lodash-es'

const DECK_MAP_PROP = 'deck-map'
const DECK_LAYER_PROVIDED = 'deck-map'
export type CoordinateExtractor = <T>(o: T) => number[]

export default function () {
  const { olMap } = useOlMap()
  const deckMap = computed(() => getDeckMap(toValue(olMap)))
  return { deckMap: deckMap }
}

function getDeckMap(map?: Map) {
  if (map) {
    let deckglMap = map.get(DECK_MAP_PROP) as DeckglMap
    if (!deckglMap) {
      deckglMap = markRaw(new DeckglMap({ zIndex: 1 }))
      map.set(DECK_MAP_PROP, deckglMap)
      map.addInteraction(deckglMap)
    }
    return deckglMap
  }
}

export function useProvideDeckLayerIds() {
  const ids = inject<MaybeRefOrGetter<string[]> | undefined>(DECK_LAYER_PROVIDED, undefined)
  return computed(() => toValue(ids))
}

export function provideDeckLayerIds(layers: LayerGetter) {
  provide(
    DECK_LAYER_PROVIDED,
    computed(() => {
      const ls = map(compact(castArray(toValue(layers))), (l) => l.props?.id).filter((id) => !!id)
      return ls
    })
  )
}
