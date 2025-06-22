<script setup lang="ts">
import { mdiHome, mdiMapMarkerMultiple } from '@quasar/extras/mdi-v7'

const route = useRoute()
const tab = ref(route.name as string)
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-tabs v-model="tab">
          <nuxt-link to="/" class="text-white">
            <q-tab name="index" :icon="mdiHome" label="Home" />
          </nuxt-link>
          <nuxt-link to="/clusters" class="text-white">
            <q-tab name="clusters" :icon="mdiMapMarkerMultiple" label="Clusters" />
          </nuxt-link>
        </q-tabs>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<style scoped></style>
