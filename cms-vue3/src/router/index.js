import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { setToken, getToken, removeToken } from "@/utils/token";
import { userStore } from "@/stores/user";
import { getUserinfo } from "@/api/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      // 重定向 进入之后自动跳转到 home 页面
      redirect: "dashboard",
      component: () => import("@/layout/index.vue"),
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          // 静态导入组件 component: HomeView,
          component: () => import("@/views/DashBoardView.vue"),
        },
        {
          path: "/about",
          name: "about",
          // 动态导入组件
          component: () => import("@/views/AboutView.vue"),
        },
      ],
    },

    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: {
        title: "用户登录",
      },
    },

    // 捕获所有路由 404页面
    // 路由规则的 path、name可作为 路由跳转 参数
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("@/views/NotFoundView.vue"),
      meta: {
        title: "页面未找到",
      },
    },
  ],
});

// 路由守卫功能
// router.beforeEach 方法的使用 ：返回false-取消导航
// 使用next 告诉它下一步做什么，不然他就什么都不返回了  next();
const pageTitle = "内容管理系统";
// 不需要登录的页面的白名单 / 利用路由的name
const whiteList = ["login", "notFound", "about"];
/**
 * 路由导航守卫
 * 在导航至下个目标页面之前进行检查

 */
router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + " - " + pageTitle;
  }
  // 权限检查功能：检查token
  const token = getToken();
  //  1. 无token，是否在白名单中
  if (!token) {
    // 1.1 如果没有 token，则检查目标路由是否在白名单中，如果目标路由在白名单中，则允许导航
    if (whiteList.indexOf(to.name) !== -1) {
      next(); //允许导航
    } else {
      // 1.2 如果目标由不在白名单中，则需要进行进一步的处理（例如，跳转到登录页面）
      // 例如：进入about页面token检查-跳转-页面路径的显示   /login?redirect=/about; 登录后，便进行重定向
      next(`/login?redirect=${to.path}`);
    }
  } else {
    //2. 有token
    // 2.1 有token并且导航指向 login
    // 如果有 token-用户鉴权，token未过期无需登录，导航至首页
    // # 导航至其他页面需要检查用户信息，为何进入首页不需要再次检查用户信息
    if (to.name == "login") {
      next("/");
    } else {
      // 2.2 有token，但导航指向 其他页面，需要再次确认
      // 读取用户信息 全局状态数据
      const store = userStore();
      if (store.userName) {
        // 2.2.1 如果存在，则继续进行下一步，允许继续访问目标路由
        next();
      } else {
        // 2.2.2 如果不存在就需要通过接口获取用户信息/异步操作
        let res = await getUserinfo();
        console.log("res: ", res);
        if (res.code == 1) {
          // 1). 更新token
          setToken(res.data.token);
          // 2). 更新全局状态
          store.setUserInfo(res.data);
          // 3). 继续导航
          next();
        } else {
          //res.code == 1 接口处理后返回的状态码 res.code!=1，即用户信息获取失败，删除token
          removeToken();
          next(`/login?redirect=${to.path}`); // 定位到login登录后重定向
        }
      }
    }
  }
});

export default router;
