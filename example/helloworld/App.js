import { h } from '../../lib/petite-vue.esm.js'
export const App = {
  // template => render 
  render() {
    return h('h2', {
      id: "root",
      class: ['fighting', 'gogogo']
    },
      /* children: string | any[] */
      // 'hi,petite-vue'
      `hi,${this.msg}`
      // [
      //   h("p", { class: 'pink' }, 'hi'),
      //   h("p", { class: 'skyblue' }, 'petite-vue')
      // ]
    )
  },
  setup() {
    return {
      msg: 'petite-vue 888'
    }
  }
}