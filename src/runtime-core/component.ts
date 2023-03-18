import { shallowReadonly } from '../reactivity/reactive';
import { isObject } from '../shared';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots } from './componentSlots';
export function createComponentInstance(vnode) {
  const componentInstance = {
    vnode,
    type: vnode.type,// component
    setupState: {},
    props: {},
    slots: {},
    emit: () => { }
  }
  componentInstance.emit = emit.bind(null, componentInstance) as any
  return componentInstance
}

export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  // 初始化slots
  initSlots(instance, instance.vnode.children)
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
    setCurrentInstance(instance);
    const readonlyProps = shallowReadonly(instance.props)
    // 传入props ctx
    const setupResult = setup(readonlyProps, {
      emit: instance.emit
    })
    setCurrentInstance(null);
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

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
