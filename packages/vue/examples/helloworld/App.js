import { h } from '../../dist/petite-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  name: 'App',
  // template => render 
  render() {
    window.self = this
    return h('h2', {
      id: "root",
      class: ['fighting', 'gogogo'],
      onClick: () => console.log('我被点了'),
      onMousemove: () => console.log('我被注意了')
    },
      /* children: string | any[] */
      // 'hi,petite-vue'
      // `hi,${this.msg}`
      [
        h("p", { class: 'pink' }, 'hi'),
        // h("p", { class: 'skyblue' }, this.msg),
        h(Foo, { count: 0 }),
      ]
    )
  },
  setup() {
    return {
      msg: 'petite-vue'
    }
  }
}