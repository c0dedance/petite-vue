import { h } from '../../lib/petite-vue.esm.js'
export const App = {
  // template => render 
  render() {
    return h('h2', `hi,${this.msg}`)
  },
  setup() {
    return {
      msg: 'petite-vue'
    }
  }
}