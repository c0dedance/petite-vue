import { reactive } from '../src/reactive'
import { effect, stop } from '../src/effect'
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
  it('scheduler', () => {
    // 1. 通过给effect传入第二个参数，一个对象的scheduler为一个fn
    // 2. effect第一个执行时还是会调用fn
    // 3. 当触发响应式更新时，fn不会被执行，而是执行了scheduler
    // 4. 执行runer才会去执行fn
    let dummy
    let run
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3 只设计get操作
    obj.prop++ // 涉及get和set，此处的get又会重新收集依赖
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })
  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
