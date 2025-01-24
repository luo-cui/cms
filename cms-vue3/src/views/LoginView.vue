<template>
  <div class="main">
    <div class="login-box">
      <div class="title">Cms管理系统</div>
      <div class="small-title">管理员登录</div>
      <!-- 表单 -->
      <div>
        <el-form
          ref="formModelRef"
          style="max-width: 600px"
          :model="formModel"
          :rules="rules"
          label-width="auto"
          class="demo-formModel"
          :size="formSize"
          status-icon
        >
          <!-- item的prop属性用于校验规则 -->
          <el-form-item prop="username">
            <el-input v-model="formModel.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="formModel.password"
              show-password
              placeholder="密码"
            />
          </el-form-item>
          <!-- 此item中有验证码输入框和验证码图片,图片占据130px -->
          <el-form-item prop="captcha">
            <el-input
              v-model="formModel.captcha"
              placeholder="验证码"
              maxlength="5"
              show-word-limit
              style="width: calc(100% - 130px)"
            />
            <!-- capchaImgUrl = '/user/captcha'  点击图片的时候更新图片地址，使用动态绑定 -->
            <img
              :src="capchaImgUrl"
              style="width: 130px"
              @click="refreshCaptcha"
            />
          </el-form-item>

          <el-form-item>
            <div class="flex flex-between" style="width: 100%">
              <el-checkbox v-model="rememberMe" label="记住密码"></el-checkbox>
              <span @click="showPwdDialog = true"> 重置密码 </span>
            </div>
          </el-form-item>

          <el-form-item class="btn-group">
            <el-button type="primary" @click="submitForm(formModelRef)">
              登录
            </el-button>
            <el-button @click="resetForm(formModelRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
  <!-- -->
  <PwdForm
    title="修改密码"
    :showDialog="showPwdDialog"
    @update:showDialog="(v) => (showPwdDialog = v)"
  >
  </PwdForm>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { login } from "@/api/user";
import { ElMessage } from "element-plus";
import { setToken } from "@/utils/token";
import { useRouter, useRoute } from "vue-router";
import { getUnamePwd, setUnamePwd, removeUnamePwd } from "@/utils/userinfo";
import { apiDomain } from "@/utils/request";
import PwdForm from "@/components/PwdForm.vue";
import AboutView from "@/views/AboutView.vue";

// router 不是一个全局变量，而是一个需要通过 useRouter 获取的对象
// 创建路由器实例，在组件中使用路由功能
const router = useRouter();
// 当前页面的路由,读取当前页面的路由参数
const route = useRoute();
// console.log("LoginView route redirect: ",route.query.redirect);

const formSize = ref("default");

// 两者的区别
// ref 是用来获取表单实例，以便调用表单的方法（如验证、重置等）
// model 是用来进行数据绑定，存储表单的实际数据值
// 有了之后就可以在这里 @click="submitForm(formModelRef)" 获取到表单了 <el-form  ref="formModelRef"  ..  >
const formModelRef = ref();
// 表单数据
const formModel = reactive({
  username: "",
  password: "",
  captcha: "",
});

// 表单验证规则
const rules = reactive({
  // 这个验证规则key对应的是表单元素中的prop属性，这2个地方保持一致就能进行验证
  username: [
    {
      required: true,
      message: "请先填写用户名",
      trigger: "blur", // 鼠标失去焦点
    },
    {
      min: 3,
      max: 20,
      message: "长度应为3-20",
      trigger: "blur",
    },
  ],
  // pwdForms组件采用了另外一种正则写法

  // # 暂时注释掉密码校验，因为后端暂时使用db的123456进行登录
  // password: [
  //   {
  //     required: true,
  //     message: "请先填写密码",
  //     trigger: "blur", // 鼠标失去焦点触发验证
  //   },
  //   {
  //     validator: (rule, value, callback) => {
  //       const regex =
  //         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/;
  //       if (!regex.test(value)) {
  //         callback(
  //           new Error("密码必须包含大小写字母、数字和特殊字符。长度应为6-20")
  //         );
  //       } else {
  //         callback();
  //       }
  //     },
  //     trigger: "blur",
  //   },
  // ],
  captcha: [
    {
      // # 暂时取消验证码
      required: false,
      message: "请先填写验证码 ",
      trigger: "blur", // 鼠标失去焦点
    },
    {
      lentgth: 5,
      message: "长度应为5",
      trigger: "blur",
    },
  ],
});

// 记住密码功能
const rememberMe = ref(false); // 初始值为F
// 这段代码会在组件创建时执行，也就是说每次用户打开登录页面时都会检查是否有保存的登录信息
const userPwd = getUnamePwd();
if (userPwd) {
  formModel.username = userPwd.username;
  formModel.password = userPwd.password;
  rememberMe.value = true;
}

// 重置密码对话框
const showPwdDialog = ref(false);
console.log("是否显示PwdDialog: ", showPwdDialog.value);
/**
 * 提交表单，需请求接口，异步函数
 *
 * @param formEl
 * 表单组件的引用（reference），在这个登录页面中具体指向了 formModelRef
 * submitForm(formModelRef)
 */
const submitForm = async (formEl) => {
  // 1. 如果 form表单不存在的话就返回
  if (!formEl) return;
  // 2. 如果存在数据,验证字段并提交表单数据到接口
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("表单字段验证通过! 数据: ", formModel);

      // 表单验证通过，调用登录接口

      // axios接口返回 promise对象,可以使用.then、.catch等链式调用进行处理

      // 登录接口:验证用户是否存在 , formModel是传入请求接口的参数
      // 成功: 弹出成功提示 - setToken -  跳转到用户中心
      login(formModel)
        .then((res) => {
          // 在then中处理后端回传的各种结果/后端的接口的return 值
          if (res.code == 1) {
            // 0.结果信息：弹出成功提示
            // 为防止后端未定义msg，默认无前者则返回后者
            ElMessage.success(res.msg || "登录成功");
            // 1. 处理 记住密码功能 的逻辑
            // 登录成功之后是否要记住密码 / 如果是,存储用户信息和勾选的记住密码
            if (rememberMe.value) {
              // 存储用户信息
              // console.log("是否记住密码：", rememberMe.value);
              setUnamePwd({
                username: formModel.username,
                password: formModel.password,
              });
            } else {
              // 当用户从"要记住密码"改为"不要记住密码"时，需要删除之前存储的账号密码
              removeUnamePwd();
            }

            // 2.token
            // 将后端返回的data中的token保存到前端
            setToken(res.data.token);

            // 3. 路由到对应页面
            // 如果存在重定向就跳它，否则跳转到用户中心
            router.push(route.query.redirect || "/");
          } else {
            // res.code !==1
            // 登录失败则则同时刷新验证码
            refreshCaptcha();
            // 后端通过校验，返回res.msg 是否是用户名或密码错误、验证码错误等
            ElMessage.error(res.msg || "登录失败");
          }
        })
        .catch((err) => {
          console.log("请求登录接口异常: ", err);
        });
    } else {
      p;
      console.log("表单字段验证失败，请检查数据: ", fields);
    }
  });
};

// # 验证码功能暂时关闭，因前端这段暂未使用，带有:暂时 前缀的
// const capchaImgUrl = '/user/captcha'  // 使用ref，因为图片会变化
// const capchaImgUrl = ref(apiDomain + "/user/captcha");  // 加入域名
//  获取当前的时间戳，并封装成响应式数据
// 暂时 const T = ref(new Date().getTime());

// 应将 computed 的参数定义为一个返回字符串的函数而非字符串
// const capchaImgUrl = computed(apiDomain + "/user/captcha?t="+T.value);

// 暂时 const capchaImgUrl = computed(() => apiDomain + "/user/captcha?t=" + T.value);
// 暂时 const refreshCaptcha = () => {
//   // 更新时间戳
//   T.value = new Date().getTime();
// };

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return; //如果表单引用无效，直接返回，防止后续代码执行
  formEl.resetFields(); //重置表单
};
</script>

<style lang="scss" scoped>
.main {
  background: #8089ff;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-box {
    background: #fff;
    width: 500px;
    padding: 30px;
    border-radius: 10px;

    .title {
      font-size: 32px;
      text-align: center;
      padding: 10px 0;
      color: var(--el-color-primary);
    }
    .small-title {
      text-align: center;
      color: var(--el-color-primary);
      padding: 15px 0;
    }
  }

  .btn-group {
    button {
      width: 243px;
    }
  }
}
</style>
