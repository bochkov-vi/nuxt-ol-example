import { inject, onMounted, onUnmounted } from 'vue'
import type { Map as OlMap } from 'ol'
import type BaseLayer from 'ol/layer/Base'

export function useOlLayer() {
  const layer = inject('olLayer', undefined) as
    | undefined
    | Ref<BaseLayer | undefined>
  return layer
}

export function useOlMap(
  mount?: (map: OlMap) => void,
  unmount?: (map: OlMap) => void
) {
  const olMap = inject('olMap', undefined) as undefined | Ref<OlMap | undefined>
  onMounted(() => {
    const map = toValue(olMap)
    if (map && mount) {
      mount(map)
    }
  })
  onUnmounted(() => {
    const map = toValue(olMap)
    if (map && unmount) {
      unmount(map)
    }
  })

  return { olMap }
}
