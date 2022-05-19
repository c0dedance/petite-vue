import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'
// 优化点：每次创建响应式对象不必重新创建set和set
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
export const mutableHandlers = {
  get,
  set
}
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value, receiver) {
    console.warn(
      `key :"${String(key)}" set fail, readonly Object must not been set`,
      target
    )
    return true
  }
}
export function createGetter(isReadonly = false) {
  return function (target, key, receiver) {
    // 通过访问某个属性触发get，由此判断区分Reactive/Readonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if (!isReadonly) {
      // 只读对象不需要收集依赖
      track(target, key)
    }
    return res
  }
}
export function createSetter() {
  return function (target, key, value, receiver) {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}
export function createReactiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
