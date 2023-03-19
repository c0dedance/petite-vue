import { h, createTextVNode, getCurrentInstance } from "../../dist/petite-vue.esm.js";
import { Foo } from "./Foo.js";

// Fragment 以及 Text
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // object key
    /* 
    <Foo>
      <p>footer</p>
    </Foo>
    */
    const foo_slot = h(
      Foo,
      {},
      h("p", {}, "footer")
    );
    /* 
    <Foo>
      <p>header</p>
      <p>footer</p>
    </Foo>
    */
    const foo_slots = h(
      Foo,
      {},
      [
        h("p", {}, "header"),
        h("p", {}, "footer"),
      ]
    );
    /* 
    <Foo>
      <template v-slot:header>
        <p>header-left</p>
        <p>header-right</p>
      </template>
      <p v-slot:footer>footer</p>
    </Foo>
    */
    const foo_named_slots = h(
      Foo,
      {},
      {
        header: [
          h("p", {}, "header-left"),
          h("p", {}, "header-right"),
        ],
        footer: h("p", {}, "footer"),
      }
    );
    /* 
    <Foo>
      <template v-slot:header="{msg}">
        <p>header{{ msg }}</p>
        你好呀
      </template>
      <p v-slot:footer>footer</p>
    </Foo>
    */
    const foo_scoped_slots = h(
      Foo,
      {},
      {
        header: ({ msg }) => [
          h("p", {}, "header" + msg),
          createTextVNode("你好呀"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );
    // 数组 vnode
    // const foo = h(Foo, {}, h("p", {}, "123"));
    return h("div", {}, [app, foo_scoped_slots]);
  },

  setup() {
    console.log('getCurrentInstance:', getCurrentInstance());
    return {};
  },
};
