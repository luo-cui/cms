<template>
  <div class="h-full">
    <div class="title">
        <b>404</b> 页面不存在
    </div>
    <img src="/svg/404.svg" />
    <div style="margin-top:30px;">
        <router-link to='/'>
          <el-button type="primary">
              返回首页
          </el-button>
        </router-link>
    </div>
  </div>
  <!-- public目录下的子目录可以直接用/ -->
</template>

<style scoped lang="scss">
/* h-full 高度是整个页面的 */
.h-full {
  height: 100vh;
  display: flex;
  justify-content: center;  
  align-items: center;
  flex-direction: column;
}
.title{
    font-size: 22px;
    margin-bottom: 20px;    

    b{
        color:var(--el-color-primary); //让404和el元素相同颜色
    }
}
</style>
