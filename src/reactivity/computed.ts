import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter) {
    this._getter = getter
    this._dirty = true
    this._effect = new ReactiveEffect(getter, () => this._dirty = true)
  }
  // 类似ref的调用，故实现其.value的getter即可
  get value() {
    /* 
    _dirty为一个标志位，初始化后锁住完成换成
    仅当依赖值更新后会通过scheduler进行解锁
    */
    if (this._dirty) {
      this._value = this._effect.run()
      this._dirty = false
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}