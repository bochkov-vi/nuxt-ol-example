<script setup lang="ts">
import { Map as OlMap, View } from 'ol'
import 'ol/ol.css'
import { onMounted, onUnmounted, provide, watch } from 'vue'

const olMap = shallowRef(
  new OlMap({
    view: new View({
      center: [0, 0],
      zoom: 3
    })
  })
)

const target = ref<HTMLDivElement>()
provide('olMap', olMap)
onMounted(() => olMap.value.setTarget(target.value))
onUnmounted(() => olMap.value.setTarget(undefined))
watch(target, (v) => {
  olMap.value.setTarget(v)
})
watch(olMap, (v, o) => {
  o?.setTarget(undefined)
  v?.setTarget(target.value)
})
</script>

<template>
  <div id="ol-map" ref="target" v-bind="$attrs">
    <slot />
  </div>
</template>

<style scoped></style>
