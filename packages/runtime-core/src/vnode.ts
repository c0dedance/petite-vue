import { ShapeFlags, isArray, isString, isObject } from '@petite-vue/shared';

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props?.key,
    el: null,
    shapeFlag: getShapeFlag(type) // 区分组件/元素
  }
  if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }
  // slots children判断：如果vnode.type是组件且children是object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}