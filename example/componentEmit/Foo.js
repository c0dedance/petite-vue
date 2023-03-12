import { h } from "../../lib/petite-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const handleClick = () => {
      console.log("handleClick");
      emit("customEvent",0);
      emit("custom-event",1,2,3);
    };

    return {
      handleClick,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.handleClick,
      },
      "click me to emit event"
    );

    const foo = h("p", {}, "foo");
    return h("div", {}, [foo, btn]);
  },
};
