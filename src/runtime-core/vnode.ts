import { isArray, isString } from './../shared/index';
import { ShapeFlags } from "../shared/ShapeFlags"

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type) // 区分组件/元素
  }
  if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }

  return vnode
}
function getShapeFlag(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}