import { isEventKey } from './../shared/index';
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './vnode';

export function render(vnode, container) {
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode

  switch (type) {
    // 处理Fragment(只渲染children)
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    // 处理Text(文字节点，纯文字无标签包裹)
    case Text:
      processText(vnode, container)
      break;

    default:
      // 处理组件
      if (ShapeFlags.STATEFUL_COMPONENT & shapeFlag) {
        processComponent(vnode, container, parentComponent)
      }
      // 处理element
      else if (ShapeFlags.ELEMENT & shapeFlag) {
        processElement(vnode, container, parentComponent)
      }
      break;
  }

}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode.children, container, parentComponent)
}
function processText(vnode, container) {
  // createVNode(Text, {}, text)
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

function mountComponent(vnode, container, parentComponent) {
  // 通过vnode创建组件实例
  const instance = createComponentInstance(vnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function mountElement(vnode, container, parentComponent) {
  const { type, props, children, shapeFlag } = vnode
  // 创建元素,并将元素挂载到vnode上
  // 这里挂载的是在subTree
  const el = vnode.el = document.createElement(type)
  // 处理props
  for (const key of Object.keys(props)) {
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
    mountChildren(children, el, parentComponent)
  }
  container.append(el)
}

function setupRenderEffect(instance, container) {
  // subTree == vnode -> patch
  const { proxy, vnode } = instance
  const subTree = instance.render.call(proxy)
  // subTree.parent = instance
  patch(subTree, container, instance)
  // 取出组件根元素的element，挂在组件上
  vnode.el = subTree.el
}

function mountChildren(children, container, parentComponent) {
  children.forEach(child => patch(child, container, parentComponent))
}