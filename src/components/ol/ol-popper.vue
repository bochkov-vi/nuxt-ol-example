<script setup lang="ts">
import type { Coordinate } from 'ol/coordinate'
import type { Instance } from '@popperjs/core'
import { createPopper } from '@popperjs/core'

const props = defineProps({
  arrow: {
    type: Boolean,
    default: true
  },
  coordinate: { type: Array as PropType<Coordinate>, default: undefined }
})
const anchor = ref<HTMLDivElement>()
const content = ref<HTMLDivElement>()
const popper = shallowRef<Instance | undefined>()

function onRender() {
  popper.value?.update()
}

const { olMap } = useOlMap(
  (map) => {
    updatePopper()
    map.on('postrender', onRender)
  },
  (map) => {
    popper.value?.destroy()
    popper.value = undefined
    map.un('postrender', onRender)
  }
)

function updatePopper() {
  if (anchor.value && content.value && olMap?.value && !popper.value) {
    popper.value = createPopper(anchor.value, content.value, {
      placement: 'top',
      modifiers: [
        { name: 'offset', options: { offset: [0, 20] } },
        {
          name: 'preventOverflow',
          options: { boundary: olMap?.value.getViewport() }
        },
      ]
    })
  } else if (popper.value) {
    popper.value.update()
  }
}

watch(() => props.coordinate, updatePopper)
</script>

<template>
  <teleport to=".q-page">
    <ol-overlay :coordinate="coordinate">
      <div ref="anchor" class="anchor" />
    </ol-overlay>
    <div v-show="popper" id="tooltip" ref="content" v-bind="$attrs">
      <slot>Здесь popper</slot>
    </div>
  </teleport>
</template>
