import { isString, isArray } from './../shared/index';
import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件
  if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
  // 处理element
  else if (isString(vnode.type)) {
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
  const { type, props, children } = vnode
  // 创建元素
  const el = document.createElement(type)
  // 处理props
  for (const key of Reflect.ownKeys(props)) {
    const value = props[key]
    el.setAttribute(key, value)
  }
  // 处理children
  if (isString(children)) {
    el.textContent = children
  } else if (isArray(children)) {
    mountChildren(children, el)
  }
  container.append(el)
}

function setupRenderEffect(instance, container) {
  // subTree == vnode -> patch
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  patch(subTree, container)
}

function mountChildren(children, container) {
  children.forEach(child => patch(child, container))
}