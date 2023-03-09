import { isEventKey } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from '../shared/ShapeFlags';

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag } = vnode
  // 处理组件
  if (ShapeFlags.STATEFUL_COMPONENT & shapeFlag) {
    processComponent(vnode, container)
  }
  // 处理element
  else if (ShapeFlags.ELEMENT & shapeFlag) {
    processElement(vnode, container)
  }
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountComponent(vnode, container) {
  // 通过vnode创建组件实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function mountElement(vnode, container) {
  const { type, props, children, shapeFlag } = vnode
  // 创建元素,并将元素挂载到vnode上
  // 这里挂载的是在subTree
  const el = vnode.el = document.createElement(type)
  // 处理props
  for (const key of Reflect.ownKeys(props)) {
    const value = props[key]
    // 处理事件
    if (isEventKey(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
      continue
    }
    // 处理属性
    el.setAttribute(key, value)
  }
  // 处理children
  if (ShapeFlags.TEXT_CHILDREN & shapeFlag) {
    el.textContent = children
  } else if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
    mountChildren(children, el)
  }
  container.append(el)
}

function setupRenderEffect(instance, container) {
  // subTree == vnode -> patch
  const { proxy, vnode } = instance
  const subTree = instance.render.call(proxy)

  patch(subTree, container)
  // 取出组件根元素的element，挂在组件上
  vnode.el = subTree.el
}

function mountChildren(children, container) {
  children.forEach(child => patch(child, container))
}