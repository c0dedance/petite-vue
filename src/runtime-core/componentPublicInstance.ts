const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  // 此处的组件实例通过ctx传递
  get({ _: instance }, key) {
    const { setupState, vnode } = instance
    if (key in setupState) {
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }

}