import { h } from '../../lib/petite-vue.esm.js'
window.self = null
export const App = {
  // template => render 
  render() {
    window.self = this
    return h('h2', {
      id: "root",
      class: ['fighting', 'gogogo']
    },
      /* children: string | any[] */
      // 'hi,petite-vue'
      // `hi,${this.msg}`
      [
        h("p", { class: 'pink' }, 'hi'),
        h("p", { class: 'skyblue' }, this.msg),
      ]
    )
  },
  setup() {
    return {
      msg: 'petite-vue'
    }
  }
}