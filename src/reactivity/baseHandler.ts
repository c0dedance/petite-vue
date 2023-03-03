import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive'
import { isObject } from './shared'
// 优化点：每次创建响应式对象不必重新创建set和set
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)
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

export const shallowReadonlyHandlers = {
  // setter逻辑同readonlyHandlers，只重写get逻辑
  ...readonlyHandlers,
  get: shallowReadonlyGet
}

export function createGetter(isReadonly = false,isShallow = false) {
  return function (target, key, receiver) {
    // 通过访问某个属性触发get，由此判断区分Reactive/Readonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key)

    // 深度响应式对象转换
    if (isObject(res) && !isShallow) {
      return isReadonly ? readonly(res) : reactive(res)
    }

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
