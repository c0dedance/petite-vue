import { h } from "../../lib/petite-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    // emit
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        // 子组件触发事件，为该事件绑定处理函数
        onCustomEvent(...payload) {
          console.log("onCustomEvent", ...payload);
        },
      }),
    ]);
  },

  setup() {
    return {};
  },
};
