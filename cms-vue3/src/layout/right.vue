<template>
  <div>
    <el-tooltip
      class="box-item"
      effect="dark"
      content="页面全屏"
      placement="bottom-end"
    >
      <el-icon :size="20" @click="toggleFullScreen" class="mr-10"
        ><FullScreen
      /></el-icon>
    </el-tooltip>

    <el-dropdown>
      <span class="el-dropdown-link">
        <el-icon class="mr-5"><UserFilled /></el-icon>
        {{ store.userName }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-icon class="mr-5"><UserFilled /></el-icon>
            个人中心
          </el-dropdown-item>
          <el-dropdown-item @click="logout">
            <el-icon class="mr-5"><SwitchButton /></el-icon>
            退出
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { userStore } from "@/stores/user";
import { userLogout } from "@/api/user";
import { removeToken } from "@/utils/token";
import { useRouter } from "vue-router";

// 使用全局状态获取用户名
const store = userStore();
const router = useRouter();

// 进入或退出全屏
const toggleFullScreen = () => {
  const element = document.documentElement; //@ 文档要素
  // 检查是否处于全屏 处于全屏则：<html>...</html> 非全屏则为undefined
  const isFullScreen =
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;
  // 如果不是全屏，则尝试进入全屏
  if (!isFullScreen) {
    if (element.requestFullscreen) {
      // @
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      /* IE11 */
      element.msRequestFullscreen();
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
};

//用户退出
const logout = () => {
  // res.code=1 接口返回成功码，但接口返回错误也可以退出,所以直接执行
  userLogout().then((res) => {
    removeToken();
    store.clearUserInfo();
    router.push("/login");
  });
};
</script>

<style>
.el-dropdown-link:focus-visible {
  /* 去掉外框线 */
  outline: unset;
}
</style>
