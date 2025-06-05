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
  const olMap = inject<Ref<OlMap | undefined>>('olMap')

  function onMapChange(nv?: OlMap, ov?: OlMap) {
    if (nv && mount) {
      mount(nv)
    }
    if (ov && unmount) {
      unmount(ov)
    }
  }

  onMounted(() => {
    onMapChange(toValue(olMap))
  })
  onUnmounted(() => {
    onMapChange(undefined, toValue(olMap))
  })
  watch(() => toValue(olMap), onMapChange)
  return { olMap }
}
