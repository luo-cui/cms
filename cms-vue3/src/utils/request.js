// 使用axios,封装get,post请求
import axios from "axios";
import { getToken } from "@/utils/token";
import { ElMessage } from "element-plus";

/**
 * 创建axios实例
 * 这个实例 request 继承了 Axios 的所有方法，包括 get、post 方法
 * const instance = axios.create([config])
 * timeout：请求超时时间（毫秒）
 */
// const request = axios.create({
//     // apifox 的 Mock 网址
//     baseURL:'https://apifoxmock.com/m1/5424273-5098690-default',
//     timeout:5000
// })

// 使用变量来读取更灵活
export const apiDomain = "https://apifoxmock.com/m1/5424273-5098690-default"; //Mock地址
// export const apiDomain = 'http://127.0.0.1:80/admin'  //后端接口

const request = axios.create({
  baseURL: apiDomain,
  timeout: 5000,
  // withCredentials: true, //跨域 // 未对接到后端接口之前暂不使用
});

// 添加请求拦截器  request.use  在发送请求之前做些什么
request.interceptors.request.use(
  function (config) {
    // 请求之前先获取token
    let token = getToken();
    // 设置请求的config中 headers 的 token，携带token进行请求
    if (token) {
      // 将请求头中的 token 修改为 Authorization 是为了符合 W3C 标准，避免 CORS 预检请求失败
      config.headers["token"] = token;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器 response.use
request.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数
    console.log("Response对象: ", response);
    // 前端部分最常用的是 响应对象中的data，所以请求成功的话返回这部分数据
    return response.data;
  },
  // 超出 2xx 范围的状态码都会触发该函数
  function (error) {
    console.log("error: ", error);
    // 对响应错误做点什么
    if (error.response && error.response.status === 404) {
      ElMessage.error("请求接口不存在");
    } else if (error.response && error.response.status === 401) {
      ElMessage.error("登录已失效，请重新登录");
      removeToken();
      window.location.reload();
    } else {
      ElMessage.error("请求异常，请检查服务器状态");
    }
    return Promise.reject(error);
  }
);

/**
 * 封装 GET 请求
 * 创建请求可添加的配置项： https://axios-http.com/zh/docs/req_config
 * @param {*} obj 存储请求地址、参数
 * @returns promise对象
 * 
 * 1. 参数名称还可以是config,options
 * obj {
 *  username:'xxx',
 *  password:'xxx'
 * }
 * 拼接 ： url?username=xxx&password=xxx
 * 2. axios.get 返回的是promise对象：可以使用 .then 、.catch
 * 向给定ID的用户发起请求 axios.get('/user?ID=12345').then((res)=>{}).catch((err)=>{})
 * 这些是创建请求时可以用的配置选项。只有 url 是必需的。如果没有指定 method，请求将默认使用 GET 方法
 * 
 * // 向给定ID的用户发起请求
 * axios.get('/user?ID=12345')
  .then(function (response) {
    // 处理成功情况
    console.log(response);
  })
  .catch(function (error) {
    // 处理错误情况
    console.log(error);
  })
  .finally(function () {
    // 总是会执行
  });

 */

// 遍历obj.data,添加到请求地址中
// 遍历obj  Object.keys，用key   Object.entries用kv对
// 对数组进行统一处理使用map方法/数组后直接调用map方法
export const get = (obj) => {
  obj.method = "GET";
  // 注意:判断! 不是所有的get请求都有参数
  if (obj.data) {
    // 重新拼接网址，将参数拼接到 url 后
    obj.url +=
      "?" +
      Object.keys(obj.data)
        .map((key) => key + "=" + obj.data[key])
        .join("&");
  }
  return request(obj);
};

/**
 * DESC:封装 POST 请求
 * @param {*} obj 请求地址、参数
 * @returns Promise对象 
 * 
 * 示例
 * axios.post('/user', {
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

 */
export const post = (obj) => {
  // // `method` 是创建请求可以用的配置选项 如果不在此处设置，则每次调用此函数传参的时候都需要传入 method:'POST'
  obj.method = "POST";
  return request(obj);
};

// 具体调用接口
// 1. 定义getUserinfo(get请求)
// export function getUserinfo(){
//   return get({
//     url:'/user/userinfo',
// })
// }
// 2. 在具体业务中调用 getUserinfo()并对响应结果进行处理
//  let res = await getUserinfo();
//         console.log("res: ", res);
//         if (res.code == 1) {
//           setToken(res.data.token);
//           store.setUserInfo(res.data);
//           next();
//         } else {
//           // 删除token
//           removeToken();
//           next(`/login?redirect=${to.path}`);
//         }
//       }
