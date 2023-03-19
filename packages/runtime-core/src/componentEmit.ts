import { camelize, toHandlerKey } from "@petite-vue/shared"

export function emit(instance, event, ...args) {
  // instance由bind时填充，用户无需显式传入
  // instance.props -> event -> eventFn()
  const { props } = instance
  // camelize: custom-event -> customEvent
  // toHandlerKey: customEvent -> onCustomEvent
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}
