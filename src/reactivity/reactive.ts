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

export function isReactive(target) {
  // 原始对象则没有劫持get，访问该属性返回undefined，我们对其转为boolean
  return !!target[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(target) {
  // 原始对象则没有劫持get，访问该属性返回undefined，我们对其转为boolean
  return !!target[ReactiveFlags.IS_READONLY]
}
export function isProxy(target) {
  return isReactive(target) || isReadonly(target)
}
