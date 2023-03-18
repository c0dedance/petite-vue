import { h, renderSlots, getCurrentInstance } from "../../lib/petite-vue.esm.js";

export const Foo = {
  name: 'Foo',
  setup() {
    console.log('getCurrentInstance:', getCurrentInstance());
    return {};
  },
  render() {
    const content = h("p", {}, "foo content");

    // Foo .vnode. children
    console.log(this.$slots);
    // children -> vnode
    //
    // renderSlots
    // 具名插槽
    // 1. 获取到要渲染的元素 1
    // 2. 要获取到渲染的位置
    // 作用域插槽
    const age = 18;
    // Foo内部
    return h("div", {}, [
      renderSlots(this.$slots, 'header', {
        msg: "header-msg"
      }),
      content,
      renderSlots(this.$slots, 'footer')
    ]);
    // return h("div", {}, this.$slots);
    // return h("div", {}, [
    //   renderSlots(this.$slots, "header", {
    //     age,
    //   }),
    //   foo,
    //   renderSlots(this.$slots, "footer"),
    // ]);
  },
};
