//src/stores/user.js
import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";

// useXXXStoresrc/stores/user.js
// 数据state、方法actions / 导出之后全局共享  /
// 第一个参数是你的应用中 Store 的唯一 ID
export const userStore = defineStore("userinfo", () => {
  const userInfo = reactive({});

  // 从userInfo中读取,计算出来所以需要计算属性
  // 获取数据的的时候不是 userInfo.userName，而是这store对象的属性 store.userNam
  const userName = computed(() => userInfo.username);
  const nickName = computed(() => userInfo.nickname);

  // 将参数info对象赋值给 state数据
  const setUserInfo = (info) => {
    Object.assign(userInfo, info); //将所有属性拷贝到了一个空对象中，并返回这个新的对象
  };

  // 清除用户信息 遍历删除每个键值对
  // @ 对象，清除属性的方法等,删除对象中的每个属性
  const clearUserInfo = () => {
    for (const k in userInfo) {
      delete userInfo[k];
    }
  };

  // @ 从store对象中解构导出这个state中可以使用的数据和修改它的方法  全局变量，有副作用
  return { userInfo, userName, nickName, setUserInfo, clearUserInfo };
});
