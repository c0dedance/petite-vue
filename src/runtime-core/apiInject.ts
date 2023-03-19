import { isFunction } from './../shared/index';
import { getCurrentInstance } from "./component";

// 提供数据
export function provide(key, value) {

  const intance: any = getCurrentInstance()
  if (intance) {
    intance.provides[key] = value
  }
}
// 消费数据
export function inject(key, defaultValue) {
  const intance: any = getCurrentInstance()
  if (intance) {
    const provides = intance.parent.provides
    // 没找到使用默认值
    const value = provides[key] ?? convertDefaultValue(defaultValue)
    return value
  }
}

function convertDefaultValue(val) {
  return isFunction(val) ? val() : val
}