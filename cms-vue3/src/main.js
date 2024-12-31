// import './assets/main.css' 

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 引入 element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'    // 越放在下面的css文件，权重会盖过上面的css文件
import './assets/main.css'
// 注册所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 使用 use注册 ElementPlus 插件
app.use(ElementPlus)
// 全局注册el 图标
// 返回一个数组：返回一个包含给定对象自身所有可枚举属性的多个 [key, value] 对的数组
// app.component(key, component) params：组件名字、组件对象
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

// 它告诉 Vue 开始渲染整个应用程序，并将其插入到页面中具有 id="app" 的 DOM 元素内
app.mount('#app') 
