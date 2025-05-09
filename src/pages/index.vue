<script setup lang="ts">
import OlMap from '~/components/ol/ol-map.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <client-only>
        <ol-map>
          <q-drawer show-if-above side="left" bordered>
            <left-side />
          </q-drawer>
          <q-page>
            <ol-view :zoom="6" />
          </q-page>
        </ol-map>
      </client-only>
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
