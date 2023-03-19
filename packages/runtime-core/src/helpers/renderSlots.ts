import { isFunction } from '@petite-vue/shared';
import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, slotName, slotProps) {
  const slot = slots[slotName]
  if (isFunction(slot)) {
    return createVNode(Fragment, {}, slot(slotProps))
  }
}