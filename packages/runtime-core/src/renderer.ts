import { effect } from '@petite-vue/reactivity';
import { ShapeFlags } from '@petite-vue/shared';
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';
import { Fragment, Text } from './vnode';
/*
  n1:old 
  n2:new
*/
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  function render(vnode, container) {
    // 挂载根组件，init逻辑
    patch(null, vnode, container, null)
  }

  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2

    switch (type) {
      // 处理Fragment(只渲染children)
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      // 处理Text(文字节点，纯文字无标签包裹)
      case Text:
        processText(n1, n2, container)
        break;

      default:
        // 处理组件
        if (ShapeFlags.STATEFUL_COMPONENT & shapeFlag) {
          processComponent(n1, n2, container, parentComponent)
        }
        // 处理element
        else if (ShapeFlags.ELEMENT & shapeFlag) {
          processElement(n1, n2, container, parentComponent)
        }
        break;
    }

  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (n1) {
      // update
      return patchElement(n1, n2, container, parentComponent)
    }
    // init
    mountElement(null, n2, container, parentComponent)
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }
  function processText(n1, n2, container) {
    // createVNode(Text, {}, text)
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }
  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement');
    console.log('n1', n1);
    console.log('n2', n2);


  }
  function mountComponent(n2, container, parentComponent) {
    // 通过vnode创建组件实例
    const instance = createComponentInstance(n2, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }

  function mountElement(n1, n2, container, parentComponent) {
    const { type, props, children, shapeFlag } = n2
    // 创建元素,并将元素挂载到vnode上
    // 这里挂载的是在subTree
    const el = n2.el = hostCreateElement(type)
    // 处理props
    for (const key of Object.keys(props)) {
      hostPatchProp(el, key, props[key])
    }
    // 处理children
    if (ShapeFlags.TEXT_CHILDREN & shapeFlag) {
      el.textContent = children // dom api?
    } else if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      mountChildren(n2, el, parentComponent)
    }
    hostInsert(container, el)
  }

  function setupRenderEffect(instance, container) {
    effect(() => {
      if (instance.isMounted) {
        console.log('setupRenderEffect: update');
        const { proxy, vnode } = instance
        const preSubTree = instance.subTree
        const subTree = instance.render.call(proxy)

        // 更新subTree
        instance.subTree = subTree

        patch(preSubTree, subTree, container, instance)
        vnode.el = subTree.el
      } else {
        /* ====== init ====== */
        console.log('setupRenderEffect: init');

        // subTree == vnode -> patch
        const { proxy, vnode } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        // subTree.parent => instance
        patch(null, subTree, container, instance)
        // 取出组件根元素的element，挂在组件上
        vnode.el = subTree.el
        instance.isMounted = true
      }
    })

  }

  function mountChildren(n2, container, parentComponent) {
    // init逻辑，故n1 = null
    const children = n2.children
    children.forEach(child => patch(null, child, container, parentComponent))
  }
  // 返回一个render
  return {
    createApp: createAppAPI(render)
  }
}