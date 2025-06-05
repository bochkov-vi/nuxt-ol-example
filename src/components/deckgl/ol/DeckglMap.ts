import type { DeckProps, Layer, MapViewState, PickingInfo } from '@deck.gl/core'
import { Deck, MapView } from '@deck.gl/core'
import type { MjolnirGestureEvent, MjolnirPointerEvent } from 'mjolnir.js'
import { sortBy, unionBy } from 'lodash-es'
import type { FrameState } from 'ol/Map'
import type { Map as OlMap } from 'ol'
import { Layer as OlLayer } from 'ol/layer'
import { toLonLat } from 'ol/proj'
import { Interaction } from 'ol/interaction'

type Options = {
  zIndex?: number
}
export default class DeckglMap extends Interaction {
  private cursor = 'inherit'
  deck?: Deck<MapView>
  sortedLayers = [] as SortedLayer[]
  private hoverListeners = [] as HoverListener[]
  private clickListeners = [] as ClickListener[]
  zIndex: number
  layer?: OlLayer

  constructor(options?: Options) {
    super()
    this.zIndex = options?.zIndex ?? 0
    this.deck = this.createDeck()
    this.addEventListener('change',()=>this.layer?.changed())
  }

  override setMap(map: OlMap | null) {
    const old = this.getMap()
    super.setMap(map)
    if (map && this.deck) {
      this.deck = this.createDeck()
      this.layer = new OlLayer({ render: this.render.bind(this) })
      map.addLayer(this.layer)
    }
    if (!map) {
      this.deck?.finalize()
      this.deck = undefined
      if (this.layer && old) {
        old.removeLayer(this.layer)
      }
      this.layer = undefined
    }
  }

  private deckOnHover(info: PickingInfo, event: MjolnirPointerEvent) {
    this.hoverListeners.forEach((l) => {
      if (l) l(info, event)
    })
  }

  private deckOnClick(info: PickingInfo, event: MjolnirGestureEvent) {
    this.clickListeners.forEach((l) => {
      if (l) l(info, event)
    })
  }

  private createDeck() {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = `${this.zIndex}`
    canvas.className = 'deck'
    return new Deck({
      views: new MapView({
        repeat: true,
        controller: false
      }),
      initialViewState: { longitude: 0, latitude: 0, zoom: 1 } as MapViewState,
      controller: false,
      canvas: canvas,
      layers: this.getRenders(),
      onHover: this.deckOnHover.bind(this),
      onClick: this.deckOnClick.bind(this),
      getCursor: () => this.cursor,
      pickingRadius: 10
    })
  }

  getRenders() {
    return sortBy(this.sortedLayers, 'zIndex')
      .map((sl) => sl?.layer())
      .flat()
      .filter((l) => !!l)
  }

  addRenders(layer: LayerGetter, zIndex?: number, key?: string) {
    if (!key) {
      key = randomKey()
    }
    this.sortedLayers = unionBy(
      this.sortedLayers,
      [{ key, zIndex, layer }],
      'key'
    )
    this.changed()
    return key
  }

  removeRenders(key?: string) {
    this.sortedLayers = this.sortedLayers.filter((l) => l.key !== key)
    this.changed()
  }

  render(frameState: FrameState) {
    const { viewState } = frameState
    const [longitude, latitude] = toLonLat(viewState.center)
    const zoom = viewState.zoom - 1
    const bearing = (-viewState.rotation * 180) / Math.PI
    const deckViewState = { bearing, longitude, latitude, zoom }
    this.deck?.setProps({ viewState: deckViewState, layers: this.getRenders() })
    return this.deck?.getCanvas() as HTMLCanvasElement
  }

  onHover(handler: HoverListener) {
    this.hoverListeners.push(handler)
    this.changed()
  }

  onClick(handler: ClickListener) {
    this.clickListeners.push(handler)
    this.changed()
  }
}

type HoverListener = DeckProps['onHover']
type ClickListener = DeckProps['onClick']
export type LayerGetter<L extends Layer = Layer> = () => L | L[] | undefined
export type SortedLayer = {
  key: string
  zIndex?: number
  layer: LayerGetter
}

function randomKey() {
  return window.crypto.randomUUID()
}
