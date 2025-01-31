<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <!-- # 动态css的写法 -->
    <el-aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
      <div class="logo flex flex-center">
        <img src="@/assets/logo.png" alt="" />
        <!-- 使用动画组件 -->
        <!-- @ 为何有name属性 ,这个在哪里用上了-->
        <Transition name="slide">
          <span v-if="!isCollapse">CMS管理系统</span>
        </Transition>
      </div>
      <!-- @ 这句如何表达 -->
      <!-- 默认激活哪个菜单选项 "currentMenuIndex"激活当前菜单 -->
      <el-scrollbar style="height: calc(100vh - 60px)">
        <el-menu
          :default-active="currentMenuIndex"
          :router="true"
          :collapse="isCollapse"
        >
          <template v-for="(item, index) in menu" :key="index">
            <!-- 1. 没有子菜单 -->
            <el-menu-item :index="item.path" v-if="!item.children">
              <!-- 因为折叠的时候需要折叠文字剩下icon ，但下面那个就不需要-->
              <el-icon v-if="item.icon">
                <component :is="item.icon"></component>
              </el-icon>
              <!-- 1.1 只有标题，无子菜单 -->
              <!-- # 需要插槽 ? el文档中是这么修改和定义的吗-->
              <!-- 为何直接用 /about  以及需要注意的是字符串 就可以导航到 -->
              <template #title>
                <span> {{ item.name }} </span>
              </template>
            </el-menu-item>

            <!-- 2. 有子菜单的 -->
            <el-sub-menu :index="item.name" v-else>
              <!-- 2.1 菜单标题 -->
              <template #title>
                <el-icon v-if="item.icon">
                  <!-- # is+componnentzuoyo-->
                  <component :is="item.icon"></component>
                </el-icon>
                <span> {{ item.name }}</span>
              </template>
              <!-- 2.2 菜单中的子菜单,不考虑子菜单中有嵌套的情况 -->
              <el-menu-item
                v-for="(submenu, ind) in item.children"
                :index="submenu.path"
                :key="ind"
              >
                <span> {{ submenu.name }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header
        style="text-align: left; font-size: 12px"
        class="flex flex-between"
      >
        <!-- header左边 -->
        <div class="flex flex-start">
          <!-- 展开、收缩按钮 -->
          <span @click="toggleSiderbarWidth" class="flex flex-center icon">
            <el-icon :size="20">
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
          </span>
          <!-- 顶部面包屑组件 显示当前路由的图标和名称 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in currentMenu"
              :key="index"
              class="flex flex-center"
            >
              <span class="flex flex-center">
                <el-icon :size="20" v-if="item.icon" class="mr-5">
                  <component :is="item.icon"></component>
                </el-icon>
                {{ item.name }}
              </span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="flex flex-end">
          <right></right>
        </div>
      </el-header>

      <el-main class="main-box">
        <!-- el-scrollbar滚动条组件 如果块中的内容高度超出的话，会自动有一个滚动条-->
        <el-scrollbar>
          <RouterView></RouterView>
        </el-scrollbar>
      </el-main>
      <el-footer class="flex flex-center">
        <sapn> @Copyright LC.com </sapn>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, useRoute, onBeforeRouteUpdate } from "vue-router";
import right from "@/layout/right.vue";

// 路由跳转
const router = useRouter();
const route = useRoute();
const currentMenuIndex = ref(route.path); // 获取当前页面的path
// 存储面包屑数据的响应式数组
// @ 是否变成reacivte 不使用reac是什么原因
const currentMenu = ref([]);

// 菜单收缩
let isCollapse = ref(false);
const toggleSiderbarWidth = () => {
  // isCollapse = !isCollapse; //# 但是直接打印控制台还是有效，但是折叠功能无效  ref的值要使用value
  isCollapse.value = !isCollapse.value;
};

// 导航菜单
const menu = reactive([
  {
    name: "数据面板",
    icon: "HomeFilled",
    path: "/dashboard",
  },
  {
    name: "Navigator One",
    icon: "message",
    children: [
      { name: "Option1", path: "/about" }, // 推荐使用前导斜杆
      { name: "Option2" },
    ],
  },
]);

// @ 将相关数据放入到这里
// 遍历菜单对象，将数据渲染到 导航面包屑上
const getCurrentMenu = () => {
  // 1. 获取本页路径
  // 仅在函数中用到，定义在函数里
  const currentPath = currentMenuIndex.value;
  // 2. 在menu中寻找此路径的导航路径，将其存储到  currentMenu对象中
  for (const key in menu) {
    if (Object.hasOwnProperty.call(menu, key)) {
      // 0.
      const element = menu[key];
      //@ 判断存在是否使用null js的惯例是怎么做 判断未定义
      //
      if (typeof element.children !== "undefined") {
        for (const k in element.children) {
          // 这个方法是检查非继承原型的属性
          // 进一步使用call：避免hasOwnProperty被覆盖过
          // 直接使用forin也可以、使用forof遍历值
          // 传入obj，key，检查是否为自有属性，返回bool
          // 当作forin即可
          if (Object.hasOwnProperty.call(element.children, k)) {
            const child = element.children[k];
            if (child.path == currentPath) {
              currentMenu.value = [element, child]; // 最多二级菜单，两级级菜单的名字
              document.title = child.name;
              console.log("有子菜单的数据结构 currentMenu", currentMenu.value);
              return; // 因为break没法跳出两层，封装成函数  找到后直接返回，结束寻找
            }
          }
        }
      } else if (element.path == currentPath) {
        currentMenu.value = [element];
        document.title = element.name;
        console.log("没有子菜单的数据结构 currentMenu", currentMenu.value);
        return;
      }

      // 分为两种情况，有子菜单和没有子菜单的情况，有没有children属性
      // if (element.path == currentMenuIndex.value) {
      //   console.log("已经遍历到当前菜单页面，停下来", element.path);
      //   break;
      // }
    }
  }
};
// @ 验证正确与否
// 调用获取面包屑数据的函数
// 切换路由的时候并没有执行这个函数，所以面包屑导航无法实时更新
getCurrentMenu();
// 导航守卫
// @ 参数to
onBeforeRouteUpdate((to) => {
  currentMenuIndex.value = to.path;
  getCurrentMenu(); //刷新面包屑
});
// header栏收缩图标
// # re
// - fix 形式错误 需要使用 计算属性
// let testIcon = ref("isCollapse?Expand:Fold")
// 使用计算属性来实现
// let tesIcon = computed(() => (isCollapse.value ? "Expand" : "Fold"));
</script>

<style scoped lang="scss">
.layout-container-demo .el-menu {
  border-right: none;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

// # 后面补充的部分
// 边栏样式、动态收缩效果
.sidebar {
  overflow: hidden; //防止元素内容超出容器
  width: 200px;
  transition: width 0.3s ease;
  background: #f0f0f0;
  padding: 0 7px;

  // # 边栏收缩时候的样式
  &.is-collapse {
    width: 60px;
    span {
      width: 0px;
      margin-left: 0;
      opacity: 0; //@ 透明度
      white-space: nowrap;
      // @ css
      //  :class="{ 'is-collapse': isCollapse }"> 作为这个动态属性
    }
  }
}
// logo样式、动态收缩效果 文字+logo
.logo {
  height: 60px;
  span {
    font-weight: bold;
    color: var(--el-color-primary);
    margin-left: 10px;
    white-space: nowrap; // 不换行
  }
}

// @ slide
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
} 

// @ 无需声明
.icon {
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 5px;
  // @ 内联元素
  display: inline-flex;

  &:hover {
    background: var(--el-menu-hover-bg-color);
  }
}
</style>
<!-- @  -->
<!-- 层级比较深的都放在外部 -->
<style lang="scss">
/* el-menu-item是在浏览器检查出来的 */
.el-menu-item {
  border-radius: 5px;
  margin: 8px 0;
  /* @ 无需声明即可使用？ */
  &.is-active {
    background-color: var(--el-menu-active-bg-color);
    color: #fff;
  }
}

.el-sub-menu__title {
  border-radius: 5px;
}
// .el-popper.is-light {
//   background: #f0f0f0;
// }
// 内外边距的调整 只能边调边试
.el-popper.is-pure {
  // padding: 0 10px;
  border-radius: 10px;
}
.el-menu--popup {
  box-shadow: none;
  padding: 5px 10px;
}
.main-box{
  background-color:  #f5f5f5; ;
}
</style>
