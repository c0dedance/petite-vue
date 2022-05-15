import { reactive } from '../reactivity'
describe('reactive', () => {
  it('happy path', () => {
    const rawObj = {
      name: 'hhh'
    }
    const obj = reactive(rawObj)
    expect(obj).not.toBe(rawObj)
    expect(obj.name).toBe('hhh')
  })
})
