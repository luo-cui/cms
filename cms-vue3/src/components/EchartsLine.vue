<template>
  <!-- 设置为100%意味着图表会占据父容器的全部宽度
这样可以实现响应式布局，当浏览器窗口或父容器大小变化时，图表宽度会自动调整
这是一个常见的响应式设计实践 -->
  <div ref="chartRef" style="height: 400px; width: 100%"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import * as echarts from "echarts";

const chartRef = ref();

// 官网中用原生js获取， var chartDom = document.getElementById('main');
// 挂载DOM元素注意：在setup执行时，DOM还没有被挂载，所以chartRef.value是undefined
// 需要在onMounted生命周期钩子中初始化图表，此时DOM已经可用
// onMounted(() => {}  // 初始化eachrt表格) 不需要再挂载，因为有监听父组件传来的数据，有变化的时候再渲染数据

const props = defineProps({
  // 子对象
  xData: {
    type: Array,
    default: [],
  },
  yData: {
    type: Array,
    default: [],
  },
  title: {
    type: String,
    default: "数据趋势图",
  },
  legendName: {
    type: String,
    default: "内容数量",
  },
});

let myChart;
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

const initChart = () => {
  var chartDom = chartRef.value; // 挂载好DOM之后不再是 undefined
  // 初始化
  myChart = echarts.init(chartDom);
  // 1. 选项 options
  var option;
  // 1.1 参数
  option = {
    title: {
      text: props.title,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#646cff",
        },
      },
    },
    legend: {
      //   data: ["内容数量"],
      data: props.legendName, // 暂未修改为数据
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: props.xData,
      //   data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "内容数量",
        data: props.yData,
        // data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#646cff", // 0% 处的颜色
              },
              {
                offset: 1,
                color: "#858bfd", // 100% 处的颜色
              },
            ],
            global: false, // 缺省为 false
          },
        },
        smooth: true,
      },
    ],
  };
  // 1.2 设置选项参数
  option && myChart.setOption(option);
};

// 监听props.xData数据的变化，有变化的话重新渲染组件
// 计算属性允许我们声明性地计算衍生值。然而在有些情况下，
// 我们需要在状态变化时执行一些“副作用”：例如更改 DOM，或是根据异步操作的结果去修改另一处的状态
// watch函数的参数  响应式对象
// 处理用的回调函数
watch(
  // 第一个参数：所监听的数据源
  //   不是直接写 obj.count,这样写不会生效，因为 obj.count 是一个数字，不是响应式数据源
  // 通过getter，vue可以追踪
  () => props.xData,
  // 第二个参数：回调函数
  () => {
    initChart();
  }
);

// 增加事件监听   监听窗口尺寸变化
onMounted(() => {
  window.addEventListener("resize", resizeChart);
});
// 移除事件监听 换路由的时候给它切换一下
// @ 切换路由时释放监听
onBeforeUnmount(() => {
  window.removeEventListener("reszie", resizeChart);
  myChart.dispose();
});
</script>
