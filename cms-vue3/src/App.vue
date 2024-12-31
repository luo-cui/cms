<script setup>
import { RouterView } from 'vue-router'
// import { getToken,setToken,removeToken } from '@/utils/token';
import {get,post} from '@/utils/request'

// get({
//    url:'/gettest',
// // 触发401状态
//    data:{
//     test:'err'
//    }
//   }).then(res=>{
//     console.log(res);
//   })

// get({
// 触发404状态
//    url:'/test123',
//   }).then(res=>{
//     console.log(res);
//   })

// post({
//   url:'/posttest',
// }).then(res=>{
//   console.log(res);
// })


</script>

<template>
  <RouterView />
</template>

<style scoped> 

</style> 
