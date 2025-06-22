import type { CompositeLayerProps, DefaultProps, Layer, LayerDataSource, LayersList, PickingInfo, UpdateParameters } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { ClusterFeature, ClusterProperties, PointFeature } from 'supercluster'
import Supercluster from 'supercluster'
import { has } from 'lodash-es'

export type IconClusterLayerPickingInfo<DataT> = PickingInfo<DataT | (DataT & ClusterProperties), { objects?: DataT[] }>
export type _ClusterLayerProps<DataT> = {
  clusterMinZoom: number
  clusterMaxZoom: number
  clusterMinPoints: number
  clusterRadius: number
  getPosition: (p: DataT) => number[] | undefined
  renderClusterLayers: (props: {
    id: string
    data: LayerDataSource<ClusterFeature<DataT> | PointFeature<DataT>>
  }) => Layer | LayersList | null
}
export type ClusterLayerProps<DataT> = CompositeLayerProps & _ClusterLayerProps<DataT>

const defaultProps: DefaultProps<ClusterLayerProps<PointFeature<unknown>>> = {
  ...CompositeLayer.defaultProps,
  clusterRadius: 40,
  clusterMinPoints: 2,
  clusterMaxZoom: 16,
  clusterMinZoom: 0
}

export class ClusterLayer<
  DataT extends NonNullable<unknown>,
  ExtraPropsT extends NonNullable<unknown> = NonNullable<unknown>
> extends CompositeLayer<ExtraPropsT & _ClusterLayerProps<DataT>> {
  static override defaultProps = defaultProps
  static override layerName = 'ClusterLayer'
  declare state: {
    index: Supercluster<DataT, DataT>
    clusters: ClusterFeature<DataT>[]
    zoom: number
    bbox: number[]
  }

  override updateState({ props, oldProps, context, changeFlags }: UpdateParameters<this>) {
    const zoom = Math.floor(context.viewport.zoom)
    const rebuildIndex =
      changeFlags.dataChanged ||
      oldProps.clusterMinZoom != props.clusterMinZoom ||
      oldProps.clusterMaxZoom != props.clusterMaxZoom ||
      oldProps.clusterRadius != props.clusterRadius ||
      oldProps.clusterMinPoints != props.clusterMinPoints ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.all)

    if (rebuildIndex) {
      const index = new Supercluster({
        maxZoom: props.clusterMaxZoom,
        minZoom: props.clusterMinZoom,
        minPoints: props.clusterMinPoints,
        radius: props.clusterRadius
      })
      if (props.getPosition) {
        index.load(
          (props.data as DataT[]).map(function (d) {
            return {
              geometry: { coordinates: props.getPosition(d) },
              properties: d
            } as PointFeature<DataT>
          })
        )
      } else {
        index.load(props.data as PointFeature<DataT>[])
      }
      this.setState({ index })
    }
    const bbox = context.viewport.getBounds()
    if (rebuildIndex || zoom !== this.state.zoom || this.isBBoxOutOfState(bbox)) {
      const w = bbox[2] - bbox[0]
      const h = bbox[3] - bbox[1]
      bbox[0] = bbox[0] - w / 2
      bbox[2] = bbox[2] + w / 2
      bbox[1] = bbox[1] - h / 2
      bbox[3] = bbox[3] + h / 2
      bbox[0] = bbox[0] - (bbox[2] - bbox[0]) / 2
      this.setState({ clusters: this.state.index.getClusters(bbox, zoom), zoom })
    }
  }

  isBBoxOutOfState(bbox: number[]) {
    if (!this.state.bbox) {
      return true
    }
    return this.state.bbox[0] >= bbox[0] || this.state.bbox[1] >= bbox[1] || this.state.bbox[2] <= bbox[2] || this.state.bbox[3] <= bbox[3]
  }

  override getPickingInfo({
    info,
    mode
  }: {
    info: PickingInfo<PointFeature<DataT> | ClusterFeature<DataT>>
    mode: string
  }): IconClusterLayerPickingInfo<DataT> {
    const pickedObject = info.object?.properties
    if (pickedObject) {
      let objects: DataT[] | undefined
      if (has(pickedObject, 'cluster_id') && mode !== 'hover') {
        const id = pickedObject.cluster_id as number
        //@ts-expect-error xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        objects = this.state.index.getLeaves(id, 25) as DataT[]
      }
      return { ...info, object: pickedObject, objects }
    }
    return { ...info, object: undefined }
  }

  override renderLayers(): Layer | LayersList | null {
    return this.props.renderClusterLayers({ id: this.props.id, data: this.state.clusters })
  }
}
