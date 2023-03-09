export const extend = Object.assign
export const isObject = val => val !== null && typeof val === "object"
export const isArray = Array.isArray
export const isString = val => typeof val === "string"
export const hasChanged = (val, newVal) => !Object.is(val, newVal)
export const isEventKey = k => /^on[A-Z][a-z]+$/.test(k)