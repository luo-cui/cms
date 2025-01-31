<template>
  <div ref="chartRef" style="height: 400px; width: 100%"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const chartRef = ref();

const props = defineProps({
  // 子对象
  pieData: {
    type: Array,
    defalut: [],
  },
  legendName: {
    type: String,
    default: "内容数量",
  },
});

// @ 监听窗口尺寸变化的原理
let myChart;
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

const initChart = () => {
  var chartDom = chartRef.value; // 挂载好DOM之后不再是 undefined
  myChart = echarts.init(chartDom);
  var option;

  option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: props.legendName,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 10,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        // 结构：数组、数组中是2个对象
        data: props.pieData,
      },
    ],
  };

  option && myChart.setOption(option);
};

watch(
  () => props.pieData,
  () => {
    initChart();
  }
);
// 增加事件监听   监听窗口尺寸变化
onMounted(() => {
  window.addEventListener("resize", resizeChart);
});
// 移除事件监听 换路由的时候给它切换一下
onBeforeUnmount(() => {
  window.removeEventListener("reszie", resizeChart);
  myChart.dispose(); // @ 避免重复渲染浪费资源 
});
</script>
