// 存储各个对象target -> 各个属性key -> dep
const targetMap = new WeakMap()

// 全局变量activeEffect是收集依赖的桥梁
let activeEffect

class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    this._fn()
  }
}

// 获取某一对象的某个属性的dep
export function getDep(target, key) {
  let depsMap = targetMap.get(target)
  // 确保总能获取到depsMap
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  // 确保总能获取到dep
  if (!dep) {
    dep = new Set() // 使用set防止多次收集同一effect
    depsMap.set(key, dep)
  }
  return dep
}
// 触发依赖
export function trigger(target, key) {
  const dep = getDep(target, key)
  for (const effect of dep) {
    effect.run()
  }
}
// 收集依赖
export function track(target, key) {
  const dep = getDep(target, key)
  dep.add(activeEffect)
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}
