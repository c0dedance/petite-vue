import { reactive } from '../reactivity'
import { effect } from '../effect'
describe('effect', () => {
  it('happy path', () => {
    const person = reactive({
      name: 'xh',
      age: 18
    })
    let nextAge
    effect(() => (nextAge = person.age + 1))
    expect(nextAge).toBe(19)

    // update
    person.age++
    expect(nextAge).toBe(20)
  })
  it('runner', () => {
    let foo = 10
    // effect(fn) -> function(runner) -> fn -> return
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const res = runner()
    expect(foo).toBe(12)
    expect(res).toBe('foo')
  })
})
