import type { ClusterFeature, ClusterProperties } from 'supercluster'
import type { Feature, Point } from 'geojson'

export default function (props: { radiusScale: number; clusterDistance: number; clusterMinZoom: number; clusterMaxZoom: number }) {
  const layerProps = computed(function () {
    const prps = {
      clusterMaxZoom: props.clusterMaxZoom,
      clusterMinZoom: props.clusterMinZoom,
      clusterDistance: props.clusterDistance,
      updateTriggers: { radiusScale: props.radiusScale },
      pointType: 'icon+circle+text',
      // настройки для иконок
      iconAtlas: 'deck-icon/marker.svg',
      iconMapping: 'deck-icon/marker.json',
      getIcon: function (f: Feature<Point, ClusterProperties & PointProperties>) {
        // иконки только для отдельных точек
        if (!f.properties.cluster) return 'marker'
      },
      getIconSize: 20,
      getIconColor: (f: Feature<Point, PointProperties>) => {
        return [f.properties.r, f.properties.g, f.properties.b]
      },
      // для кружков
      filled: true,
      stroked: true,
      getPointRadius: (f: ClusterFeature<PointProperties>) => {
        if (f.properties.point_count) {
          const radius = 15 + Math.log(f.properties.point_count ?? 1) * props.radiusScale
          return radius
        }
      },
      pointRadiusUnits: 'pixels',
      getLineColor: (f: Feature<Point, ClusterProperties>) => {
        //только для кластеров для иконок прозрачный цвет
        if (f.properties.cluster) return [255, 255, 255]
        else return [0, 0, 0, 0]
      },
      getFillColor: (f: Feature<Point, ClusterProperties>) => {
        //только для кластеров для иконок прозрачный цвет
        if (f.properties.cluster) return [0, 0, 255, 50]
        else return [0, 0, 0, 0]
      },
      lineWidthMinPixels: 3,
      //надписи для кластеров
      getText: function (f: Feature<Point, ClusterProperties>) {
        if (f.properties.point_count) return `${f.properties.point_count}`
      },
      getTextSize: 10,
      textSizeUnits: 'pixels'
    }
    return prps
  })
  return { props, layerProps }
}
