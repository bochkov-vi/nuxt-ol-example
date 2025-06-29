import { CompositeLayer, type DefaultProps, type Layer, type LayersList, log, type PickingInfo, type UpdateParameters } from '@deck.gl/core'
import type { ClusterFeature, ClusterProperties, PointFeature } from 'supercluster'
import Supercluster from 'supercluster'
import { has } from 'lodash-es'
import type { GeoJsonLayerProps } from '@deck.gl/layers'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, GeoJSON, Geometry, Point } from 'geojson'

export type ClusterLayerPickingInfo<FeaturePropertiesT> = PickingInfo<
  FeaturePropertiesT | (FeaturePropertiesT & ClusterProperties),
  {
    objects?: FeaturePropertiesT[]
  }
>
export type _ClusterLayerProps<FeaturePropertiesT> = {
  clusterMinZoom: number
  clusterMaxZoom: number
  clusterMinPoints: number
  clusterDistance: number
  getCentroid?: (f: Feature<Geometry, FeaturePropertiesT>) => PointFeature<FeaturePropertiesT>
}
export type ClusterLayerProps<FeaturePropertiesT> = GeoJsonLayerProps<FeaturePropertiesT> & _ClusterLayerProps<FeaturePropertiesT>

const defaultProps: DefaultProps<ClusterLayerProps<unknown>> = {
  ...GeoJsonLayer.defaultProps,
  clusterDistance: 40,
  clusterMinPoints: 2,
  clusterMaxZoom: 16,
  clusterMinZoom: 0
}

export class ClusterLayer<
  FeaturePropertiesT extends NonNullable<unknown>,
  ExtraPropsT extends NonNullable<unknown> = NonNullable<unknown>
> extends CompositeLayer<ExtraPropsT & _ClusterLayerProps<FeaturePropertiesT>> {
  static override defaultProps = defaultProps
  static override layerName = 'ClusterLayer'
  declare state: {
    index: Supercluster<FeaturePropertiesT, FeaturePropertiesT>
    clusters: Feature<Point, FeaturePropertiesT & ClusterProperties>[]
    zoom: number
    bbox: number[]
  } & GeoJsonLayer['state']

  override updateState({ props, oldProps, context, changeFlags }: UpdateParameters<this>) {
    super.updateState({ props, oldProps, context, changeFlags })
    const zoom = Math.floor(context.viewport.zoom)
    const rebuildIndex =
      changeFlags.dataChanged ||
      oldProps.clusterMinZoom != props.clusterMinZoom ||
      oldProps.clusterMaxZoom != props.clusterMaxZoom ||
      oldProps.clusterDistance != props.clusterDistance ||
      oldProps.clusterMinPoints != props.clusterMinPoints ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.all)

    if (rebuildIndex) {
      const index = new Supercluster({
        maxZoom: props.clusterMaxZoom,
        minZoom: props.clusterMinZoom,
        minPoints: props.clusterMinPoints,
        radius: props.clusterDistance,
        log: false
      })
      const features = getGeojsonFeatures<FeaturePropertiesT>(props.data as GeoJSON)
      if (props.getCentroid) {
        index.load(features.map(props.getCentroid))
      } else {
        index.load(features as PointFeature<FeaturePropertiesT>[])
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

  override shouldUpdateState({ changeFlags }: UpdateParameters<this>) {
    return changeFlags.somethingChanged
  }

  override getPickingInfo({
    info,
    mode
  }: {
    info: PickingInfo<PointFeature<FeaturePropertiesT> | ClusterFeature<FeaturePropertiesT>>
    mode: string
  }): ClusterLayerPickingInfo<FeaturePropertiesT> {
    const pickedObject = info.object?.properties
    if (pickedObject) {
      let objects: FeaturePropertiesT[] | undefined
      if (has(pickedObject, 'cluster_id') && mode !== 'hover') {
        const id = pickedObject.cluster_id as number
        //@ts-expect-error xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        objects = this.state.index.getLeaves(id, 25) as FeaturePropertiesT[]
      }
      return { ...info, object: pickedObject, objects }
    }
    return { ...info, object: undefined }
  }

  override renderLayers(): Layer | LayersList | null {
    //@ts-expect-error override data TS error
    return new GeoJsonLayer(this.props, { data: this.state.clusters, id: `${this.props.id}-geojson` })
  }
}

export function getGeojsonFeatures<FeaturePropertiesT>(geojson: GeoJSON): Feature<Geometry, FeaturePropertiesT>[] {
  // If array, assume this is a list of features
  if (!geojson) {
    return []
  }
  if (geojson instanceof Promise) {
    return []
  }
  if (Array.isArray(geojson)) {
    return geojson
  }
  log.assert(geojson.type, `GeoJSON does not have type:${geojson}`)
  switch (geojson.type) {
    case 'Feature':
      // Wrap the feature in a 'Features' array
      return [geojson as Feature<Geometry, FeaturePropertiesT>]
    case 'FeatureCollection':
      // Just return the 'Features' array from the collection
      log.assert(Array.isArray(geojson.features), 'GeoJSON does not have features array')
      return geojson.features as Feature<Geometry, FeaturePropertiesT>[]
    default:
      // Assume it's a geometry, we'll check type in separateGeojsonFeatures
      // Wrap the geometry object in a 'Feature' object and wrap in an array
      return [{ geometry: geojson }] as Feature<Geometry, FeaturePropertiesT>[]
  }
}
