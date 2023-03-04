import { reactive, isReactive, isProxy } from '../reactive'
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
    expect(isProxy(obj)).toBe(true)
  })

  test("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
})
