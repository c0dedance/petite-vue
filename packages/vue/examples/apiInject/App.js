// 组件 provide 和 inject 功能
import { h, provide, inject } from "../../dist/petite-vue.esm.js";

const Provider = {
  name: "Parent",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("h3", {}, "Parent-Provider"), h(Child)]);
  },
};

const Child = {
  name: "Child",
  setup() {
    provide("foo", "fooTwo");
    // provide("baz", 0);
    const foo = inject("foo");

    return {
      foo,
    };
  },
  render() {
    return h("h4", {}, [
      h("p", {}, `Child foo:${this.foo}`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Descendant",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // const baz = inject("baz", "bazDefault");
    const baz = inject("baz", () => "bazDefault");

    return {
      foo,
      bar,
      baz,
    };
  },

  render() {
    return h("h5", {}, `Descendant-Consumer: - ${this.foo} - ${this.bar}-${this.baz}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("h2", {}, "apiInject"), h(Provider)]);
  },
};
