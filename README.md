## Reactivity (响应式）

响应式系统核心数据结构：

WeakMap：维护多个对象与其key的集合Map的映射

Map：维护某个对象的所有key与对应key的依赖项集合的映射

Set：依赖项集合，防止收复收集使用Set而不是Array

**因此，可通过target + key  => deps**

![image](https://user-images.githubusercontent.com/38075730/221393326-cdfe03f0-a89b-473f-a0d8-74ac65aef78d.png)



- [x] **effect**

  effect函数相当于一个工厂函数，返回一个ReactEffect实例

- [x] **reactive 依赖收集 & 触发依赖**

  响应式对象的getter触发时会收集依赖，当setter触发时会触发依赖

- [x] **runner**

  effect函数执行会返回runner函数，通过调用runner函数可以强制执行fn，同时也会触发依赖更新

  runner的返回值就是fn的返回值

- [x] **scheduler**

  怎么用：作为effect的选项传入
  effect的首次行为仍旧是执行传入的fn

  响应式对象更新了，不会直接执行依赖项runner，而是执行scheduler，用于自定义触发依赖更新时机
  当然，直接调用runner可以调用到fn，进而更新依赖

- [x] **stop 及其优化 & onStop**

  实现stop函数，就是要让收集“我”的响应式对象的deps把我剔除
  
  函数接收一个runner，通过runner的某个属性反向找到effect对象（在返回runner前挂载到runner函数）
  
  effect在此之前都是单向收集，即响应式对象收集effect到它的依赖集合，我们收集的时候继续反向收集（effect.deps.push(依赖集合)），stop调用时，在这个集合我把自己剔除即可
  
  ![image](https://user-images.githubusercontent.com/38075730/221486138-2b476e23-c94c-4e34-befa-c1b12a42538a.png)
  
  base case：
  
  防止收集空依赖
  
  在触发getter时收集依赖，触发setter时触发依赖的前提是，相关代码是包裹在effect函数中的。
  
  否则activeEffect没有放置ReactiveEffect实例拿到的空，后续调用属性方法报错！
  
  收集时加上判空
  
  ~~~js
  if (activeEffec && activeEffect.active) {
      activeEffect.deps.push(dep)
      dep.add(activeEffect)
  }
  ~~~
  
  状态记录
  
  假设又对依赖项进行了 getter，也就是 track，那么就会再次将所属的 track 收集起来，那么 stop 删除的元素就等于是重新就加回来了，所以我们需要给当前ReactiveEffect实例加一个状态/标志位进行锁定！只收集`active === true`的依赖
  
  **进一步优化**
  
  1. 在 stop 后，我们已经把自己从依赖集合剔除了，但难保后续不会走最初的逻辑，可以给`activeEffect = null`，防止后续getter收集到（obj.value++）
  
     ~~~js
     run() {
       if (!this.active) {
         return this._fn()
       }
       activeEffect = this
       const res = this._fn()
       activeEffect = null
       return res
     }
     ~~~
  
     
  
  2. 也可以在全局开关`shouldTrack`默认为false，收集时开启，收集后关闭
  
     ~~~js
     run() {
       // 当前stop的状态下，只去执行fn，而不收集依赖（不开启shouldTrack && activeEffect = null）
       if (!this.active) {
         return this._fn()
       }
       shouldTrack = true
       activeEffect = this
       const res = this._fn()
       // 完成收集后置空，防止stop的effect对象触发getter收集到
       // activeEffect = null
       shouldTrack = false
       return res
     }
     ~~~
  
  3. 此外，我们已经把自己从依赖集合剔除了，自身反向收集的数组也可置空
  
  **onStop**
  
  如果创建ReactiveEffect实例时有传，则在`effect.stop()`执行是进行回调


- [ ] **readonly**

  setter啥也不做，不修改原对象值

- [ ] **isReactive & isReadonly**

  在创建响应式对象时，在其属性挂上一个flag，通过flag的值来标识该对象的类型；但挂在属性上可能冲突，也可能被重写。

  冲突问题可以使用复杂的命名、symbol解决

  重写问题可以通过`defineProperty`（`writable=false`）解决

  vue是在get时对访问的key进行判断，如果访问的key为特定的标识则进行对应处理

- [ ] **深度响应式 & 深度readonly**

  重复get获得的响应式对象是不是同一个？

  是的，因为通过`reactive`创建响应式对象时，原对象已经放在全局的map中了，已经存在这种映射关系

- [ ] **shallowReadonly**

  浅层属性的setter具有Readonly特性，深层次不做

- [ ] **isProxy**

  在代理对象时，会在实例上添加私有属性`__v_reactive = true`的标识，进行读取即可

  特别的，在创建（继承自Cpmponent）react组件时，原型上有属性`isClassComponent`可用于判断组件是否为react组件

  `isReactive` or `isReadonly`等API可以

  检查一个对象是否是由 [`reactive()`](https://cn.vuejs.org/api/reactivity-core.html#reactive)、[`readonly()`](https://cn.vuejs.org/api/reactivity-core.html#readonly)、[`shallowReactive()`](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive) 或 [`shallowReadonly()`](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly) 创建的代理。

  ```typescript
  function isProxy(value: unknown): boolean
  `isProxy` => `isReactive || isReadonly`
  ```

- [ ] **ref**

  deps获取路径：

  + reactive对象（weakMap --target-> Map --key->  deps）
  + ref对象（weakMap --target-> deps）

  reactive对象的deps存在全局的map，而ref只需要通过原对象就可以拿到deps，因为只有value才需要实现响应式，所有deps挂在ref实例上即可

  抽取reactive相关逻辑（`trackEffects`、`triggerEffects`、）

- [ ] **isRef**

  判断某个值是否为 ref，逻辑同`isProxy`

- [ ] **unRef**

  如果是ref则进行解包，返回`.value`的值，否则返回原值

- [ ] **proxyRefs**

  template中，我们可以无需.value进行访问ref，是因为编译后的代码，vue帮我做了一层`proxyRef`的包裹

  触发getter时，key对应的value值为`ref`，则进行`unRef`，否则返回原值

  触发setter时，总是要进行替换，

  + 但如果newVal是非ref值，原来的是ref，则将set赋值给.value

  + 其他情况都是直接替换，包括`target[key]`isRef newVal isRef

  ![](https://img.qkeep.cn/imgs/202309180015235.jpg)

- [ ] **computed**

  

- [ ] **watch**？

- [ ] **watchEffect**？

## runtime

- [ ] **component init**

  组件相当于箱子，element的集合
  render就是开箱
  渲染组件相当于渲染返回的render里面的element
  如果是组件，继续拆箱
  如果是element，则创建element并渲染

- [ ] **element init**

- [ ] **组件代理对象**

  render函数如何通过this获取数据，如this.$el、this.$data

  给render绑定this为instance.proxy

  instance.proxy = new Proxy

  getter中尝试在setupState取值

  instance.vnode.el 为什么是空的？

  > 组件vnode.el啥也没有，因为不会走到mountElement去创建element
  > 只有组件根的vnode.el才有
  > render前找不到this.$el render元素中也找不到

  mountElement里面的vnode和instance.vnode有何区别

- [ ] **shapeFlags**

  > shapeFlags用于描述一个vnode的flag，
  >
  >  ELEMENT = 1, *// 0001* =>元素
  >
  >  STATEFUL_COMPONENT = 1 << 1, *// 0010* =>组件
  >
  >  TEXT_CHILDREN = 1 << 2, *// 0100* =>文本children
  >
  >  ARRAY_CHILDREN = 1 << 3 =>数组children

  位运算判断比通过map更加高效，提高性能，牺牲可读性

- [ ] 事件注册

  通过正则匹配事件key进行注册

- [ ] 组件props

  > 用法：1. 可以在setup取到 2. 可以通过this取值 3. 只读

- [ ] 组件emit

  > 父组件通过在子组件上绑定自定义事件 custom-event 来监听子组件的点击事件。在子组件的 handleClick 方法中，通过 emit 向父组件传递了事件和数据。当父组件接收到 custom-event 事件时，它将调用 handleCustomEvent 方法并打印出传递的数据。

  emit（公共函数）-> instance.props -> event -> eventHadle( )

- [ ] 组件slots

- [ ] Flagment

  特性：只渲染children，防止多根节点和dom层级嵌套过深

- [ ] Text node

  特性：只渲染纯文本，外层不需要包裹组件

- [ ] getCurrentInstance

  通过一个全局变量，巧妙拿到当前实例；因为限制了getCurrentInstance在setup函数使用，只需在调setup前，将当前实例放到全局变量上，getCurrentInstance直接返回该变量即可，调用结束后置空

- [ ] Provide & inject

  子组件消费父组件数据，是通过类似原型链进行查找

- [ ] 自定义渲染器

  本质上就是加了一层，用于对接不同平台去实现

  为什么需要自定义渲染器：跨平台渲染 toCanvas to安卓 toTerminal等

  createApp和运行环境挂钩，应该由runtime-dom提供

   createApp依赖render（patch（元素创建更新插入））

  render在createRender里面，如何拿到

  1.  直接返回render，用户使用createApp时显式地将他传入`createApp(render,App)`

  2.  通过闭包的形式储存/柯里化，导出一个引用着render的createApp

     ~~~js
     // createApp.ts
     export function createAppAPI(render) {
       return function createApp(rootComponent) {
         return {
           mount(rootContainer) {
             // ...
             render(vnode, rootContainer)
           }
         }
       }
     }
     // renderer.ts
     export function createRenderer(options) {
       return {
         createApp: createAppAPI(render)
         
       }
     }
     // runtime-dom
     const renderer: any = createRenderer({
       createElement,
       patchProp,
       insert,
     })
     // 实际给外部使用者使用的createApp
     export function createApp(...args) {
       return renderer.createApp(...args)
     }
     ~~~

     

- [ ] element update

- [ ] element props update

  更新props情况

  遍历新的

  新旧属性值不相等 => 

  1. 新的为空：删除
  2. 设置为新值（新增/更新值）

  遍历旧的

  1. 旧的有新的没有，删除属性

- [ ] element children update

  > 相同节点如何定义
  > 疏忽了，需要递归的diff
  > key如何来的：props.key放到vnode.key
  >
  > 如何获取描点元素？
  >
  > n2.children[i].el不为null？ 前面节点相同会递归patch子节点，递归完成后新的vnode对应位置的老的vnode都有el

  更新children有4种情况：节点类型判断

  1. Array->Text：清空数组，替换文本
  2. Text->Text：替换文本
  3. Text->Array：清空文本，mountChildren（此时他还是vnode）
  4. Array->Array：diff

  **diff keyedNodes**

  相同节点：patch patchElement

  > i为左侧相同的指针，e1、e2为右侧相同指针

  **新的比老的多**

  创建的条件是？`i > e1`

  新增的区间：`[i,e2]`

  如何新增元素：`ptach(null,el)`

  ~~~js
  if (i > e1) {
      if (i <= e2) {
          for (let j = i; j <= e2; j++) {
              patch(null,c2[j], container, parentComponent)
          }
      }
  }
  ~~~

  插入元素在前面，需要使用inserBefore + 锚点元素

  如何获取描点元素？（**获取锚点注意是否越界**）

  1. 根据`e1`
  2. 根据`i`:

  **老的比新的多**

  移除的条件是？`i > e2`

  移除的区间：`[i,e1]`

  如何移除：`hostRemove`

- [ ] 双端diff算法

  base：在**c2中查找，没有则移除，否则可以复用(继续patchProps)**

  查找新节点是否在里面老节点 map优化

  新节点都找到复用进行patch过，剩下的老节点可以直接移除，而不用走下面的逻辑（找newIndex）

  性能优化：寻找稳定的序列，不稳定的元素才会去移动

- [ ] diff的key作用

- [ ] 最长子序列

  使用最长递增子系列来优化节点的移动

  新节点数组在旧节点数组的索引位置，在位置数组中递增就能保证在旧数组中的相对位置的有序性，从而不需要移动，因此递增子序列的最长可以保证移动次数的最少
   或者可以理解为: 新旧节点数组的`最长公共子系列`，在旧节点数组中除去最长公共子系列的其他节点是需要进行处理（移动、删除）

  vue3 需要的不是子序列长度，也不是最终的子序列数组，而是子序列对应的索引

  > 推荐阅读
  >
  > https://juejin.cn/post/6988489193215229982
  >
  > https://juejin.cn/post/6937243374453784613
  >
  > https://segmentfault.com/a/1190000042974066

- [ ] component update

- [ ] nextTick

## compiler

- [ ] 插值解析
- [ ] element标签解析
- [ ] text解析
- [ ] 三种联合类型template解析
- [ ] parse的实现原理
- [ ] 有限状态机
- [ ] transform实现
- [ ] string生成
- [ ] 生成插值类型
- [ ] 生成三种联合类型
- [ ] 编译template -> render
- [ ] monorepo
- [ ] jest -> vitest


## monorepo化
通过install实现子包的相互引用，配置`tsconfig.json`的`paths`让ts能正确识别引用不报错，rollup ts插件也能正确处理；配置`vitest.config.ts`的`resolve.alias`确保用例编译时能正确处理引用关系；