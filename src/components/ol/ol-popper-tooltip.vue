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
const tooltip = ref<HTMLDivElement>()
let popper: Instance | undefined

const { olMap } = useOlMap(
  () => {
    updatePopper()
  },
  () => {
    popper?.destroy()
  }
)

function updatePopper() {
  if (anchor.value && tooltip.value && olMap?.value) {
    if (!popper) {
      popper = createPopper(anchor.value, tooltip.value, {
        placement: 'top',
        modifiers: [
          { name: 'offset', options: { offset: [0, 20] } },
          {
            name: 'preventOverflow',
            options: { boundary: olMap?.value.getViewport() }
          },
          { name: 'arrow', options: { element: '#arrow' } }
        ]
      })
    } else {
      popper.update()
    }
  } else {
    if (popper) {
      popper.destroy()
      popper = undefined
    }
  }
}

watch(() => props.coordinate, updatePopper)
</script>

<template>
  <teleport to=".q-page">
    <ol-overlay :coordinate="coordinate">
      <div ref="anchor" class="anchor" />
    </ol-overlay>
    <div v-if="coordinate" id="tooltip" ref="tooltip" v-bind="$attrs">
      <div v-show="arrow" id="arrow" data-popper-arrow />
      <slot>Здесь popper tooltip</slot>
    </div>
  </teleport>
</template>

<style scoped>
.anchor {
  background: transparent;
  z-index: 3;
  width: 1px;
  height: 1px;
  pointer-events: none;
  position: absolute;
}

#tooltip {
  z-index: 3;
  color: white;
  pointer-events: none;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  background-blend-mode: normal;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  background-blend-mode: normal;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}

#tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -4px;
}

#tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -4px;
}

#tooltip[data-popper-placement^='left'] > #arrow {
  right: -4px;
}

#tooltip[data-popper-placement^='right'] > #arrow {
  left: -4px;
}
</style>
