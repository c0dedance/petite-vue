import { track, trigger } from './effect'
export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key)
      // 收集依赖
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value)
      // 触发依赖
      trigger(target, key)
      return res
    }
  })
}

export function readonly(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      return Reflect.get(target, key)
    },
    set(target, key, value, receiver) {
      return false
    }
  })
}
