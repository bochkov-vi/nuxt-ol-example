import { MVTLayer, type MVTLayerProps } from '@deck.gl/geo-layers'
import type { PointFeature } from 'supercluster'
import type { FilterContext, Layer, LayersList, UpdateParameters } from '@deck.gl/core'
import { ClusterLayer, type ClusterLayerProps } from '~/components/ol/deckgl/cluster/cluster.layer'
import { debounce, map, omit, uniqBy } from 'lodash-es'
import type { Feature } from 'geojson'

export type _ClusterMvtLayerProps<DataT extends PointFeature<unknown>> = {} & ClusterLayerProps<DataT> & MVTLayerProps
export type ClusterTileLayerProps<DataT extends PointFeature<unknown> = PointFeature<unknown>> = _ClusterMvtLayerProps<DataT> &
  MVTLayerProps &
  ClusterLayerProps<DataT>

export class ClusterMvtLayer<
  DataT extends PointFeature<unknown> = PointFeature<unknown>,
  ExtraPropsT extends NonNullable<unknown> = NonNullable<unknown>
> extends MVTLayer<DataT[], ExtraPropsT & Required<ClusterTileLayerProps>> {
  static override defaultProps = {
    ...MVTLayer.defaultProps,
    clusterRadius: 40,
    clusterMinPoints: 2,
    clusterMaxZoom: 12,
    clusterMinZoom: 0,
    binary: false
  }
  static override layerName = 'ClusterMvtLayer'

  declare state: {
    dataNeedUpdate: boolean
    features?: DataT[]
    showClusters: boolean
    collectData: () => void
  } & MVTLayer['state']

  override initializeState() {
    super.initializeState()
    this.setState({
      collectData: debounce(() => {
        const features = this.getFeatures()
        // console.log('collect data execute')
        this.setState({ features: features, dataNeedUpdate: false })
      }, 150)
    })
  }

  override updateState(params: UpdateParameters<this>) {
    const isLoaded = this.state.tileset?.isLoaded
    const loadingStateChanged = this.state.isLoaded !== isLoaded
    if (this.state.dataNeedUpdate || (isLoaded && loadingStateChanged)) {
      /*console.log(
        'collect data call',
        'isLoaded:',
        isLoaded,
        'loadingStateChanged:',
        loadingStateChanged,
        'dataNeedUpdate',
        this.state.dataNeedUpdate
      )*/
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
    const featuers = map(this.state.tileset?.tiles, 'dataInWGS84')
      .flat()
      .filter((o) => !!o) as Feature[]
    const uniqueIdProperty = this.props.uniqueIdProperty
    if (uniqueIdProperty) {
      return uniqBy(featuers, (f) => f.properties?.[uniqueIdProperty])
    } else {
      return uniqBy(featuers, 'id')
    }

    return featuers
  }

  override shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
    return changeFlags.somethingChanged
  }
}
