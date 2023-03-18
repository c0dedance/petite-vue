import { isFunction } from './../../shared/index';
import { createVNode } from "../vnode";

export function renderSlots(slots, slotName, slotProps) {
  const slot = slots[slotName]
  if (isFunction(slot)) {
    return createVNode('div', {}, slot(slotProps))
  }
}