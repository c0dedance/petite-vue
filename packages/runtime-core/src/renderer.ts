import { isNil } from '@petite-vue/shared';
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
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    // 移除逻辑

    const { shapeFlag, type } = n2

    switch (type) {
      // 处理Fragment(只渲染children)
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      // 处理Text(文字节点，纯文字无标签包裹)
      case Text:
        processText(n1, n2, container)
        break;

      default:
        // 处理组件
        if (ShapeFlags.STATEFUL_COMPONENT & shapeFlag) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        // 处理element
        else if (ShapeFlags.ELEMENT & shapeFlag) {
          processElement(n1, n2, container, parentComponent, anchor)
        }
        break;
    }

  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (n1) {
      // update
      return patchElement(n1, n2, container, parentComponent, anchor)
    }
    // init
    mountElement(null, n2, container, parentComponent, anchor)
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }
  function processText(n1, n2, container) {
    // createVNode(Text, {}, text)
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement');
    console.log('n1', n1);
    console.log('n2', n2);
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    // 从旧vnode取出dom元素，同时传给新vnode（接力）
    const el = n2.el = n1.el
    patchChildren(el, n1, n2, parentComponent, anchor)
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
  function patchChildren(el, n1, n2, parentComponent, anchor) {
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
        mountChildren(n2.children, el, parentComponent, anchor)
      } else {
        // Array diff Array
        patchKeyedChildren(n1.children, n2.children, el, parentComponent, anchor);

      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    const len = Math.min(e1, e2)
    let i = 0

    // 1.锁定左侧
    while (i <= len) {
      const n1 = c1[i]
      const n2 = c2[i]
      // 如果根节点相同，则对比子树
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }
    // 2.锁定右侧（e1,e2不超过前面锁定的起点）
    while (e1 >= i && e2 >= i) {
      // while (e1 > -1 && e2 > -1) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }
    // c1 === c2相同 
    if (e1 < i && e2 < i) {
      return
    }
    // 3.新的比老的多，需要创建
    if (i > e1) {
      if (i <= e2) {
        // 获取锚点注意是否越界 同时锚点是本次新增的过程固定一个的
        // const nextPos = i + 1
        const nextPos = e1 + 1
        const anchor = nextPos < c1.length ? c1[nextPos].el : null // c2[nextPos].el只有有对应c1的el也有值
        while (i <= e2) {
          patch(null, c2[i++], container, parentComponent, anchor)
        }

      }
    }
    // 4.老的比新的多,需要移除
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i++].el)
      }
    }
    // 5.处理乱序部分
    else {
      const s1 = i
      const s2 = i
      // 新节点都找到复用(patch过)，剩下的老节点可以直接移除
      let needPatchCount = e2 - s2 + 1
      // map优化查找
      const keyMapNewIndex = {}
      for (let i = s2; i <= e2; i++) {
        const key = c2[i]?.key
        if (!isNil(key)) {
          keyMapNewIndex[key] = i
        }
      }

      for (let i = s1; i <= e1; i++) {
        const preChild = c1[i]

        // 新的节点更新完了，老的节点跳过查找直接移除
        if (!needPatchCount) {
          hostRemove(preChild.el)
          continue
        }
        // 在c2中查找，没有则移除，否则可以复用
        let newIndex
        // 老节点可能没有key
        if (!isNil(preChild.key)) {
          newIndex = keyMapNewIndex[preChild.key]
        } else {
          for (let j = s2; j <= e2; j++) {
            const nextChild = c2[j]
            if (isSomeVNodeType(preChild, nextChild)) {
              newIndex = j
              break
            }
          }
        }
        // 不可以复用
        if (newIndex === undefined) {
          hostRemove(preChild.el)
        } else {
          patch(preChild, c2[newIndex], container, parentComponent, null)
          needPatchCount--
        }
      }
    }



    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }
  }
  function unmountChildren(children) {
    children.forEach(child => hostRemove(child.el))
  }
  function mountComponent(n2, container, parentComponent, anchor) {
    // 通过vnode创建组件实例
    const instance = createComponentInstance(n2, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container, anchor)
  }

  function mountElement(n1, n2, container, parentComponent, anchor) {
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
      mountChildren(n2.children, el, parentComponent, anchor)
    }
    hostInsert(container, el, anchor)
  }

  function setupRenderEffect(instance, container, anchor) {
    effect(() => {
      if (instance.isMounted) {
        console.log('setupRenderEffect: update');
        const { proxy, vnode } = instance
        const preSubTree = instance.subTree
        const subTree = instance.render.call(proxy)

        // 更新subTree
        instance.subTree = subTree

        patch(preSubTree, subTree, container, instance, anchor)
        vnode.el = subTree.el
      } else {
        /* ====== init ====== */
        console.log('setupRenderEffect: init');

        // subTree == vnode -> patch
        const { proxy, vnode } = instance
        const subTree = instance.subTree = instance.render.call(proxy)
        // subTree.parent => instance
        patch(null, subTree, container, instance, anchor)
        // 取出组件根元素的element，挂在组件上
        vnode.el = subTree.el
        instance.isMounted = true
      }
    })

  }

  function mountChildren(children, container, parentComponent, anchor) {
    // init逻辑，故n1 = null    
    children.forEach(child => patch(null, child, container, parentComponent, anchor))
  }
  // 返回一个render
  return {
    createApp: createAppAPI(render)
  }
}