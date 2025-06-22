<script setup lang="ts">
import OlMap from '~/components/ol/ol-map.vue'
import MlMaptilerBright from '~/components/layers/ml-maptiler-bright.vue'
</script>

<template>
  <ol-map>
    <ml-maptiler-bright />
    <q-drawer show-if-above side="left" bordered>
      <clusters-left-side />
    </q-drawer>
    <q-page>
      <ol-view :zoom="6" :center="[160, 52]" />
    </q-page>
  </ol-map>
</template>

<style scoped></style>
