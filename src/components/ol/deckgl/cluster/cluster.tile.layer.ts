import { type _TileLoadProps, TileLayer, type TileLayerProps } from '@deck.gl/geo-layers'
import type { FilterContext, Layer, LayersList, UpdateParameters } from '@deck.gl/core'
import { ClusterLayer, type ClusterLayerProps, getGeojsonFeatures } from '~/components/ol/deckgl/cluster/cluster.layer'
import { debounce, omit } from 'lodash-es'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import type { GeoJsonLayerProps } from '@deck.gl/layers'

export type _ClusterTileLayerProps<FeaturePropsT extends GeoJsonProperties> = {
  onTileLoadStart?: (tile: _TileLoadProps) => void
} & ClusterLayerProps<FeaturePropsT>

export type ClusterTileLayerProps<FeaturePropsT extends GeoJsonProperties = GeoJsonProperties> = _ClusterTileLayerProps<FeaturePropsT> &
  Omit<TileLayerProps, 'data'> &
  GeoJsonLayerProps<FeaturePropsT>

export class ClusterTileLayer<
  FeaturePropsT extends GeoJsonProperties = GeoJsonProperties,
  ExtraPropsT extends NonNullable<unknown> = NonNullable<unknown>
> extends TileLayer<NonNullable<unknown>, ExtraPropsT & Required<ClusterTileLayerProps>> {
  static override defaultProps = {
    ...TileLayer.defaultProps,
    clusterRadius: 40,
    clusterMinPoints: 2,
    clusterMaxZoom: 12,
    clusterMinZoom: 0
  }
  static override layerName = 'ClusterTileLayer'

  declare state: {
    dataNeedUpdate: boolean
    features?: Feature<Geometry, FeaturePropsT>[]
    showClusters: boolean
    collectData: () => void
  } & TileLayer['state']

  override initializeState() {
    super.initializeState()
    this.setState({
      collectData: debounce(() => {
        this.setState({ features: this.getFeatures(), dataNeedUpdate: false })
      }, 150)
    })
  }

  override updateState(params: UpdateParameters<this>) {
    const isLoaded = this.state.tileset?.isLoaded
    const loadingStateChanged = this.state.isLoaded !== isLoaded
    if (this.state.dataNeedUpdate || (isLoaded && loadingStateChanged)) {
      this.setState({ dataNeedUpdate: false })
      this.state.collectData()
    }
    const zoom = Math.floor(params.context.viewport.zoom)
    const showClusters = this.props.clusterMaxZoom >= zoom && zoom >= this.props.clusterMinZoom
    if (showClusters != this.state.showClusters) {
      this.setState({ showClusters })
    }
    super.updateState(params)
  }

  override renderLayers(): Layer | LayersList | null {
    const layers = super.renderLayers() as Array<Layer>
    if (this.state.showClusters) {
      const clusterProps = omit(this.props, 'data')
      layers.push(
        //@ts-expect-error TS unknown error
        new ClusterLayer(clusterProps, {
          id: `${this.props.id}-clusters`,
          data: this.state.features
        })
      )
    }
    return layers
  }

  override filterSubLayer(ctx: FilterContext): boolean {
    if (this.state.showClusters) {
      return ctx.layer instanceof ClusterLayer
    }
    return super.filterSubLayer(ctx)
  }

  getFeatures() {
    const featuers = this.state.tileset?.tiles
      .map((t) => getGeojsonFeatures(t.data))
      .flat()
      .filter((o) => !!o)
    return featuers
  }

  override getTileData(tile: _TileLoadProps): Promise<NonNullable<unknown>> | NonNullable<unknown> | null {
    this._onTileLoadStart(tile)
    return super.getTileData(tile)
  }

  _onTileLoadStart(tile: _TileLoadProps) {
    this.props.onTileLoadStart(tile)
  }

  override shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
    return changeFlags.somethingChanged
  }
}
