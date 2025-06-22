import { TileLayer, type TileLayerProps } from '@deck.gl/geo-layers'
import type { PointFeature } from 'supercluster'
import type { Layer, LayersList, UpdateParameters } from '@deck.gl/core'
import { compact } from 'lodash-es'
import { ClusterLayer, type ClusterLayerProps } from '~/components/ol/deckgl/cluster/cluster.layer'

export type _ClusterTileLayerProps<DataT extends PointFeature<unknown>> = {
  renderSubLayers?: (props: ClusterTileLayerProps<DataT> & { id: string; data: DataT[] }) => Layer | null | LayersList
} & Omit<TileLayerProps, 'renderSubLayers'>
export type ClusterTileLayerProps<DataT extends PointFeature<unknown> = PointFeature<unknown>> = _ClusterTileLayerProps<DataT> &
  TileLayerProps &
  ClusterLayerProps<DataT>

export class ClusterTileLayer<
  DataT = PointFeature<unknown>,
  ExtraPropsT extends NonNullable<unknown> = NonNullable<unknown>
> extends TileLayer<DataT, ExtraPropsT & Required<ClusterTileLayerProps>> {
  static override defaultProps = ClusterLayer.defaultProps
  static override layerName = 'ClusterTileLayer'

  override updateState(params: UpdateParameters<this>) {
    super.updateState(params)
  }

  override renderLayers(): Layer | LayersList | null {
    const data = compact(
      this.state.tileset?.selectedTiles
        ?.filter((t) => t.isLoaded)
        .map((t) => t.data)
        .flat()
    )

    return new ClusterLayer(this.props, { id: this.props.id, data: data })
  }

  override renderSubLayers(): Layer | LayersList | null {
    return []
  }

  override filterSubLayer(): boolean {
    return false
  }
}
