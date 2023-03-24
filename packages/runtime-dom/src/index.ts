import { isNil } from './../../shared/src/index';
import { createRenderer } from '@petite-vue/runtime-core'
import { isEventKey } from '@petite-vue/shared';
export function createElement(type) {
  return document.createElement(type)
}
export function patchProp(el, key, preValue, nextValue) {
  // 处理事件
  if (isEventKey(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
    return
  }
  // 处理属性
  if (isNil(nextValue)) {
    // nextValue空，为删除属性
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, nextValue)
  }
}
export function insert(container, el) {
  return container.append(el)
}

// renderer.createApp(内部引用着render)
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
})
// 实际给外部使用者使用的createApp
export const createApp = renderer.createApp

// export function createApp(...args) {
//   return renderer.createApp(...args)
// }
export * from '@petite-vue/runtime-core'
