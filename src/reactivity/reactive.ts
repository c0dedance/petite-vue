import {
  createReactiveObject,
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandler'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(obj) {
  // 原始对象则没有劫持get，访问该属性返回undefined，我们对其转为boolean
  return !!obj[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(obj) {
  // 原始对象则没有劫持get，访问该属性返回undefined，我们对其转为boolean
  return !!obj[ReactiveFlags.IS_READONLY]
}
