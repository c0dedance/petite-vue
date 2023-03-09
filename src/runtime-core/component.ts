import { isObject } from '../shared';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
export function createComponentInstance(vnode) {
  const componentInstance = {
    vnode,
    type: vnode.type,// component
    setupState: {}
  }

  return componentInstance
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

  // ctx 把instance放在target对象，作为一个ctx传递
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
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
