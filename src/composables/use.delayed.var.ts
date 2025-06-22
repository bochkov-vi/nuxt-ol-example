import { debounce } from 'lodash-es'

export default function <T>(v: Ref<T>, wait = 350) {
  const r = ref(toValue(v))
  const setter = debounce((_v) => (v.value = _v), wait)
  watch(v, setter)
  return r
}
