import { extend } from './shared'

// 存储各个对象target -> 各个属性key -> dep
const targetMap = new WeakMap()

// 全局变量activeEffect是收集依赖的桥梁
let activeEffect

class ReactiveEffect {
  private _fn: any
  deps = []
  active = true // 表示当前effect状态
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    const res = this._fn()
    // 完成收集后置空，防止stop的effect对象触发getter收集到
    activeEffect = null
    return res
  }
  stop() {
    // 优化点：设置状态保证只清空一次deps，避免用户频繁调用stop
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        // 触发钩子onStop
        this.onStop()
      }
      this.active = false
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
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
  // 当不是由effect引起的get时，不收集依赖，此时activeEffect为空
  if (!activeEffect) return
  dep.add(activeEffect)
  // activeEffect反向收集dep
  activeEffect.deps.push(dep)
  /* 
  dep是什么，是一个set，储存着所有effec实例对象
  一个对象的一个key -> 一个dep，收集所有effec实例对象（fn）
  effec实例对象的deps 收集所有dep 即这个fn所有依赖的key
  */
}
/* 
scheduler第一次不会被触发，在初始化是不进行调用，仅调用fn
在后续更新只执行scheduler：trigger时有scheduler就仅执行它，没有传入则默认执行fn
scheduler放在effect示例上，可以像调用run方法一样去执行
*/
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // 合并options
  extend(_effect, options)
  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  // 将effect挂载到runner,方便我们通过runner调用stop
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
