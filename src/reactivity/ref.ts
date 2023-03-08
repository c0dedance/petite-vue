import { hasChanged, isObject } from '../shared/index';
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from './reactive';

class RefImpl {
  private _value: any
  private _rawValue: any
  private deps = new Set()
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }
  get value() {
    if (isTracking()) {
      // 依赖收集
      trackEffects(this.deps)
    }
    return this._value
  }
  set value(newVal) {
    if (!hasChanged(this._rawValue, newVal)) return
    // obj.value 被赋值了新的对象，需要初始化时传入对象比较而不是和代理后的比较，否则总是不相等的
    this._rawValue = newVal
    this._value = convert(newVal)
    triggerEffects(this.deps)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

function convert(value) {
  // 如果.value的值对应一个对象，则走 reactive 的逻辑
  return isObject(value) ? reactive(value) : value
}

export function isRef(ref) {
  return !!ref?.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}
/* 
触发getter时，key对应的value值为`ref`，则进行`unRef`，否则返回原值
触发setter时，总是要进行替换，
  但如果newVal是非ref值，原来的是ref，则将set赋值给.value
  其他情况都是直接替换，包括`target[key]`isRef newVal isRef
*/
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },

    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}