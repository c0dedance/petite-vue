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
  // 创建元素,并将元素挂载到vnode上
  // 这里挂载的是在subTree
  const el = vnode.el = document.createElement(type)
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
  const { proxy, vnode } = instance
  const subTree = instance.render.call(proxy)

  patch(subTree, container)
  // 取出组件根元素的element，挂在组件上
  vnode.el = subTree.el
}

function mountChildren(children, container) {
  children.forEach(child => patch(child, container))
}