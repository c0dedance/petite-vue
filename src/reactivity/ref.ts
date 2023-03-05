import { hasChanged } from './shared/index';
import { isTracking, trackEffects, triggerEffects } from "./effect"

class RefImpl {
  private _value: any
  private deps = new Set()
  constructor(value) {
    this._value = value
  }
  get value() {
    if (isTracking()) {
      // 依赖收集
      trackEffects(this.deps)
    }
    return this._value
  }
  set value(newVal) {
    if (!hasChanged(this._value, newVal)) return
    this._value = newVal
    triggerEffects(this.deps)
  }
}

export function ref(value) {
  return new RefImpl(value)
}