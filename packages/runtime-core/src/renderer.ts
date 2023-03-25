import { effect } from '@petite-vue/reactivity';
import { EMPTY_OBJ, ShapeFlags } from '@petite-vue/shared';
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
    remove: hostRemove,
    setElementText: hostSetElementText,
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
    mountChildren(n2.children, container, parentComponent)
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
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    // 从旧vnode取出dom元素，同时传给新vnode（接力）
    const el = n2.el = n1.el
    console.log(container, 'container');
    console.log(el, 'el');
    patchChildren(el, n1, n2, parentComponent)
    patchProps(el, oldProps, newProps)

  }
  function patchProps(el, oldProps, nextProps) {
    if (oldProps === nextProps) {
      return
    }
    // 遍历新节点
    for (const key of Object.keys(nextProps)) {
      const preProp = oldProps[key]
      const nextProp = nextProps[key]
      // 不同值更新（新增）
      if (preProp !== nextProp) {
        hostPatchProp(el, key, preProp, nextProp)
      }
    }
    if (oldProps === EMPTY_OBJ) {
      return
    }
    for (const key of Object.keys(oldProps)) {
      const preProp = oldProps[key]
      // 不同值更新（新增）
      if (!(key in nextProps)) {
        hostPatchProp(el, key, preProp, null)
      }
    }
  }
  function patchChildren(el, n1, n2, parentComponent) {
    const preshapeFlag = n1.shapeFlag
    const nextshapeFlag = n2.shapeFlag

    // Array | Text -> Text
    if (nextshapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 可能需要清空（Array）然后替换
      if (preshapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1.清空children
        unmountChildren(n1.children)
      }
      // 2.替换文本
      if (n1.children !== n2.children) {
        hostSetElementText(el, n2.children)
      }
    }
    // Array | Text -> Array
    if (nextshapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (preshapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 1.清空文本
        hostSetElementText(el, '')
        // 2.mountChildren
        mountChildren(n2.children, el, parentComponent)
      }
    }
  }
  function unmountChildren(children) {
    children.forEach(child => hostRemove(child.el))
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
      hostPatchProp(el, key, null, props[key])
    }
    // 处理children
    if (ShapeFlags.TEXT_CHILDREN & shapeFlag) {
      el.textContent = children // dom api?
    } else if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      mountChildren(n2.children, el, parentComponent)
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

  function mountChildren(children, container, parentComponent) {
    // init逻辑，故n1 = null    
    children.forEach(child => patch(null, child, container, parentComponent))
  }
  // 返回一个render
  return {
    createApp: createAppAPI(render)
  }
}