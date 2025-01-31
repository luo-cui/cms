<template>
  <!-- @ 样式card、data-card设计层级是？ -->
  <div class="grid card">
    <!-- 有4个块，将他们循环出来 -->
    <!-- 不是普通的style写法，加上大括号 @ -->
    <div
      class="data-card card"
      v-for="(item, index) in datas"
      :key="index"
      :style="{ backgroundColor: colors[index] }"
    >
      <div class="title">{{ item.title }}</div>
      <div class="flex flex-between">
        <el-icon :size="40">
          <component :is="item.icon"></component>
        </el-icon>
        <!-- 数字组件 原先为{{ item.count} }} -->
        <span class="count">
          <count-to
            :startVal="0"
            :endVal="item.count"
            :decimals="0"
            :duration="3000"
          ></count-to>
        </span>
      </div>
    </div>
  </div>
  <div class="flex flex-between mt-20">
    <div class="card mr-20" style="width: 70%">
      <!-- 折线趋势图组件 -->
      <!-- 等到从接口获取数据完毕之后再渲染组件   v-if="lineData.x"也可以使用watch监听数据变化 -->
      <EchartsLine :x-data="lineData.x" :y-data="lineData.y"></EchartsLine>
    </div>
    <div class="card" style="width: 25%">
      <!-- 环状图组件 -->
      <EchartsPie :pieData="pieData"></EchartsPie>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { CountTo } from "vue3-count-to";
import { getDatas, getWeekDatas, getContentDatas } from "@/api/dashboard";
import EchartsLine from "@/components/EchartsLine.vue";
import EchartsPie from "@/components/EchartsPie.vue";

// 数据面板的颜色，进行动态渲染
const colors = ["#ec4786", "#7858bd", "#5dc0ef", "#faab34"];

// const datas = getDatas()  // 接口正确响应但数据是无法渲染的
// 异步处理，等待接口回传
// @ reactive不需要 。value才能引用?目前确认ref是需要的
const datas = ref([]); // @为何用ref获取这个数据,用reactive的时候是更方便使用内部的数据
getDatas().then((res) => {
  if (res.code == 1) {
    datas.value = res.data;
  }
});

// 折线趋势图 数据；父组件传递给子组件
// @ 仅仅处理then，不处理其他
const lineData = reactive({});
getWeekDatas().then((res) => {
  if (res.code == 1) {
    (lineData.x = res.data.keys), (lineData.y = res.data.values);
  }
});

// 环状图数据
const pieData = ref([]); //使用ref([])定义为空数组会导致错误，这个数组是在外面再嵌套一层吗
getContentDatas().then((res) => {
  if (res.code == 1) {
    pieData.value = res.data.values;
  }
});
</script>

<style lang="scss" scoped>
.grid {
  /* 等长，等分成 4块 */
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  .data-card {
    color: #fff;
  }
}
.count {
  font-size: 32px;
  font-weight: bold;
}
</style>
