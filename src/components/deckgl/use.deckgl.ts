import type { Map } from 'ol'
import DeckglMap from '~/components/deckgl/ol/DeckglMap'

const DECK_MAP_PROP = 'deck-map'
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
