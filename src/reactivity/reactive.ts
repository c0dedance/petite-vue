import {
  createReactiveObject,
  mutableHandlers,
  readonlyHandlers
} from './baseHandler'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
export function isReactive(obj) {
  // 原始对象则没有劫持get，访问该属性返回undefined，我们对其转为boolean
  return !!obj[ReactiveFlags.IS_REACTIVE]
}
