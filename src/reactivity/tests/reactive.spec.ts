import { reactive, isReactive } from '../reactive'
describe('reactive', () => {
  it('happy path', () => {
    const rawObj = {
      name: 'hhh'
    }
    const obj = reactive(rawObj)
    expect(obj).not.toBe(rawObj)
    expect(obj.name).toBe('hhh')
    expect(isReactive(obj)).toBe(true)
    expect(isReactive(rawObj)).toBe(false)
  })
})
