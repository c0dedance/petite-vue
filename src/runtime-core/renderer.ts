import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件
  processComponent(vnode, container)
  // 处理element
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  // 通过vnode创建组件实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // subTree == vnode -> patch
  const subTree = instance.render()

  patch(subTree, container)
}