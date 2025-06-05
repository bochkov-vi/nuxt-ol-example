<script setup lang="ts">
import { Map as OlMap } from 'ol'
import 'ol/ol.css'
import { provide } from 'vue'

const olMap = shallowRef<OlMap>()
onMounted(() => {
  olMap.value = new OlMap()
})
provide('olMap', olMap)
</script>

<template>
  <slot />
</template>

<style scoped></style>
