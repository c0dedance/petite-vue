export const extend = Object.assign
export const isObject = val => val !== null && typeof val === "object"
export const isArray = Array.isArray
export const isString = val => typeof val === "string"
export const isFunction = val => typeof val === "function"
export const isNil = val => val === undefined || val === null
export const hasChanged = (val, newVal) => !Object.is(val, newVal)
export const isEventKey = k => /^on[A-Z][a-z]+$/.test(k)
export const hasOwn = (target, key) => target?.hasOwnProperty(key)
// 转化为驼峰命名
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : ""
}
export const EMPTY_OBJ = Object.freeze({})
export * from './ShapeFlags'