import { h } from '../../lib/petite-vue.esm.js'

export const Foo = {
  name: 'Foo',
  // 1.在setup参数传入props
  setup(props) {
    // props.count
    console.log(props);

    // 3.
    // shallow readonly
    props.count++
    console.log(props);

  },
  render() {
    // 在this取到props属性值
    return h("div", {}, "foo: " + this.count);
  },
};
