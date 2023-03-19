import { ShapeFlags, isArray } from '@petite-vue/shared';

export function initSlots(instance, children) {
  // slots children才进行处理
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }

}
function normalizeObjectSlots(children, slots) {
  for (const name in children) {
    const slot = children[name]
    // createVNode('div', {}, slot(slotProps))
    slots[name] = props => normalizeSlotValue(slot(props))
  }
}
function normalizeSlotValue(value) {
  return isArray(value) ? value : [value];
}
