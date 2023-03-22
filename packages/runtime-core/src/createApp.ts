import { createVNode } from "./vnode"

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // component -> vnode
        // 将所有逻辑转化为vnode，所以操作都是基于vnode进行处理
        const vnode = createVNode(rootComponent)

        render(vnode, rootContainer)
      }
    }
  }
}

