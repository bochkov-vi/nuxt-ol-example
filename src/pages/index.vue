<script setup lang="ts">
import OlMap from '~/components/ol/ol-map.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <ol-map>
        <q-drawer show-if-above side="left" bordered>
          <left-side />
        </q-drawer>
        <q-page>
          <ol-view :zoom="6" :center="[160,52]" />
        </q-page>
      </ol-map>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
