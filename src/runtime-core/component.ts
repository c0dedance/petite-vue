import { isObject } from '../shared';
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component
}

export function setupComponent(instance) {
  // 初始化props
  // initProps();
  // 初始化slots
  // initSlots();
  // 初始化状态
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {

  // ctx
  instance.proxy = new Proxy({}, {
    get(target, key) {
      const { setupState } = instance
      if (key in setupState) {
        return setupState[key]
      }
    }
  })
  // vnode.type就是Component本身
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // function

  // object
  if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
