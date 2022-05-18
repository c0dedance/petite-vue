import {
  createReactiveObject,
  mutableHandlers,
  readonlyHandlers
} from './baseHandler'

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
