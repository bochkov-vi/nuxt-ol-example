<script setup lang="ts">
import MlMap from '~/components/ol/maplibre/ml-map.vue'

const style =
  'https://api.maptiler.com/maps/bright-v2/style.json?key=rd7EMHAR9iRNhDzz2KFn'
</script>

<template>
  <ml-map :style="style" />
</template>

<style scoped></style>
