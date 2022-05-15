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
})
