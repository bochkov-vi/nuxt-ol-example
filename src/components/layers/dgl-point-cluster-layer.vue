<script lang="ts" setup>
import DglLayer from '~/components/ol/deckgl/dgl-layer.vue'
import { IconLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import type { ClusterFeature } from 'supercluster'
import { ClusterLayer } from '~/components/ol/deckgl/cluster/cluster.layer'
import type { Color } from '@deck.gl/core'

const featureCollection = useRandomPoints(1000000)
const layers = () => {
  return new ClusterLayer({
    id: 'dgl-point-cluster-layer',
    data: featureCollection.features,
    clusterMaxZoom: 12,
    renderClusterLayers(props) {
      return [
        new ScatterplotLayer({
          id: `${props.id}-cluster-circles`,
          data: props.data,
          radiusUnits: 'pixels',
          getRadius: (f) => {
            const radius = 15 + Math.log(f.properties.point_count ?? 1)
            return radius
          },
          getPosition: (p) => {
            if (p.properties.cluster) return p.geometry.coordinates
          },
          stroked: true,
          radiusMinPixels: 5,
          filled: true,
          getLineColor: [0, 0, 255],
          getFillColor: [0, 0, 255, 50],
          lineWidthMinPixels: 1
        }),
        new TextLayer({
          id: `${props.id}-cluster-labels`,
          data: props.data,
          getText: (f: ClusterFeature<unknown>) => {
            if (f.properties.point_count) return `${f.properties?.point_count}`
            return ''
          },
          getPosition: (p) => {
            if (p.properties.cluster) return p.geometry.coordinates
          },
          getSize: 10,
          sizeUnits: 'pixels'
        }),
        new IconLayer({
          id: `${props.id}-point-icons`,
          data: props.data,
          getPosition: (p) => {
            if (!p.properties.cluster) return p.geometry.coordinates
          },
          iconAtlas: 'deck-icon/marker.svg',
          iconMapping: 'deck-icon/marker.json',
          getIcon: () => 'marker',
          getSize: 20,
          getColor: (f) => {
            return [f.properties.r, f.properties.g, f.properties.b]
          }
        })
      ]
    }
  })
}
</script>

<template>
  <dgl-layer :layers="layers" />
</template>

<style scoped></style>
