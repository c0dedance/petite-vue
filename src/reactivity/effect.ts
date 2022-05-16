// 存储各个对象target -> 各个属性key -> dep
const targetMap = new WeakMap()

// 全局变量activeEffect是收集依赖的桥梁
let activeEffect

class ReactiveEffect {
  private _fn: any
  constructor(fn, public scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    return this._fn()
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
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
// 收集依赖
export function track(target, key) {
  const dep = getDep(target, key)
  dep.add(activeEffect)
}
/* 
scheduler第一次不会被触发，在初始化是不进行调用，仅调用fn
在后续更新只执行scheduler：trigger时有scheduler就仅执行它，没有传入则默认执行fn
scheduler放在effect示例上，可以像调用run方法一样去执行
*/
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  _effect.run()

  return _effect.run.bind(_effect)
}
