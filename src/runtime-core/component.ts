export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
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
  if (typeof setupResult === "object" && setupResult !== null) {
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
