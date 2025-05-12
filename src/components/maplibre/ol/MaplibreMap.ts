import type { Map as OlMap } from 'ol'
import type { IControl, StyleSpecification } from 'maplibre-gl'
import { Map as MlMap } from 'maplibre-gl'
import { Interaction } from 'ol/interaction'
import type { ListenerFunction } from 'ol/events'
import { Layer } from 'ol/layer'
import type { FrameState } from 'ol/Map'
import { toLonLat } from 'ol/proj'
import MapboxLanguage from '@mapbox/mapbox-gl-language'

const MAPLIBRE_PROP = 'maplibre'
const MAPLIBRE_STYLE = 'maplibre-style'
const MAPLIBRE_CONTAINER = 'maplibre-cont'
type Options = {
  style: string | StyleSpecification
}

export default class MaplibreMap extends Interaction {
  constructor(options?: Options) {
    super()
    this.style = options?.style
    this.addChangeListener(MAPLIBRE_CONTAINER, this.initMaplibre.bind(this))
    this.addChangeListener(MAPLIBRE_STYLE, this.initMaplibre.bind(this))
    //@ts-expect-error ts-type error
    this.layer = new Layer({ render: this.render.bind(this) })
  }

  layer: Layer

  get maplibre(): MlMap | undefined {
    return this.get(MAPLIBRE_PROP)
  }

  set maplibre(value: MlMap | undefined) {
    this.set(MAPLIBRE_PROP, value)
  }

  get style(): string | StyleSpecification | undefined {
    return this.get(MAPLIBRE_STYLE)
  }

  set style(value: string | StyleSpecification | undefined) {
    this.set(MAPLIBRE_STYLE, value)
  }

  get container(): string | HTMLElement | undefined {
    return this.get(MAPLIBRE_CONTAINER)
  }

  set container(value: string | HTMLElement | undefined) {
    this.set(MAPLIBRE_CONTAINER, value)
  }

  onTargetChange: ListenerFunction = (e) => {
    const m = e.target as OlMap
    this.container = m.getTarget()
  }

  override setMap(map: OlMap | null) {
    const old = this.getMap()
    if (old) {
      old.removeChangeListener('target', this.onTargetChange)
      if (this.layer) old.removeLayer(this.layer)
    }
    super.setMap(map)
    if (map) {
      this.container = map.getTarget()
      map.addChangeListener('target', this.onTargetChange.bind(this))
      map.addLayer(this.layer)
    } else {
      this.container = undefined
    }
  }

  initMaplibre() {
    if (this.maplibre) {
      this.maplibre.remove()
      this.maplibre = undefined
    }
    const target = this.getMap()?.getTarget()
    if (target && this.style) {
      const map = new MlMap({
        attributionControl: false,
        boxZoom: false,
        container: target,
        doubleClickZoom: false,
        dragPan: false,
        dragRotate: false,
        interactive: false,
        keyboard: false,
        pitchWithRotate: false,
        scrollZoom: false,
        touchZoomRotate: false,
        hash: false,
        style: this.style
      })
      map.on('load', () => {
        const language = new MapboxLanguage() as unknown as IControl
        map.addControl(language)
      })
      this.maplibre = map
    }
  }

  render(frameState: FrameState) {
    const map = this.maplibre
    if (map) {
      const canvas = map.getCanvas()
      const { viewState } = frameState
      canvas.style.position = 'absolute'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '0'
      // adjust view parameters in mapbox
      const rotation = viewState.rotation
      map.jumpTo({
        center: toLonLat(viewState.center) as [number, number],
        zoom: viewState.zoom - 1,
        bearing: (-rotation * 180) / Math.PI
      })
      requestAnimationFrame(() => {
        map._render(0)
      })
      return canvas
    }
  }
}
