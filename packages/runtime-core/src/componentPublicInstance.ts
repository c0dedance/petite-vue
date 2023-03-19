import { hasOwn } from '@petite-vue/shared';

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
};
export const PublicInstanceProxyHandlers = {
  // 此处的组件实例通过ctx传递
  get({ _: instance }, key) {
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    if (hasOwn(props, key)) {
      return props[key]
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }

}