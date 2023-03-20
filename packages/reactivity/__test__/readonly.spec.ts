import { isReadonly, readonly, isProxy } from '../src/reactive'
import { vi } from 'vitest'

describe('readonly', () => {
  it('should make nested values readonly', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)

    expect(isReadonly(wrapped)).toBe(true)
    expect(isProxy(wrapped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    // 深度readonly
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);

    expect(wrapped.foo).toBe(1)
  })
  it('should call console.warn when set', () => {
    // mock 使用假的fn去替换console.warn，方便断言
    console.warn = vi.fn()
    const user = readonly({
      age: 10
    })

    user.age = 11
    expect(console.warn).toHaveBeenCalled()
  })
})
