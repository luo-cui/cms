<template>
  <!-- 显示/隐藏对话框  -->
  <el-dialog v-model="dialogVisible" :title="title" width="500">
    <div>
      <!-- 插入 form 表单 -->
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
        <el-form-item label="新密码" prop="password">
          <el-input v-model="formModel.password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="re_password">
          <el-input v-model="formModel.re_password" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formModel.phone" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <!--  v-model.number 输入必须为数字否则不显示-->
          <el-input v-model="formModel.code" />
          <!-- <el-button type="primary" @click = "sendSms">发送验证码</el-button> -->
          <!-- 倒计时出现之后就不能点击了 :disabled 表单元素的属性/条件判断表达式 -->
          <el-button type="primary" @click="sendSms" :disabled="seconds > 0">
            <span v-if="seconds > 0">{{ seconds }}</span>
            <span v-else>发送验证码</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formModelRef)">
          提交
        </el-button>
        <el-button @click="resetForm(formModelRef)">重置</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref, reactive, computed, handleError } from "vue";
import { resetPwdSms } from "@/api/sms";
import { resetPwdByPhone } from "@/api/user";
import { pwdRules } from "@/utils/tools";

const formSize = ref("default");
const formModelRef = ref();
// 创建一个响应式对象，对象的所有属性都是响应式的
const formModel = reactive({
  password: "",
  re_password: "",
  phone: "",
  code: "",
});

// 验证规则：同原密码
// password 、re_password都应用同样的规则，所以将此规则封装出来在工具文件中，再导入

// 每个数据带有一个规则数组， 数组中可定义 多个规则对象
const rules = reactive({
  password: pwdRules,
  // 这个密码需要和新密码一致，需要另外自定义规则2次输入的密码一致
  // ...pwdRules 将 pwdRules 数组中的所有元素展开并添加到 re_password 数组中
  re_password: [
    ...pwdRules,
    // 自定义规则是对象属性
    // validator: func
    // 此项需要验证用户输入是否一致
    {
      validator: (rule, value, callback) => {
        // formModel是响应式对象，获取对象的属性值同js
        if (value !== formModel.password) {
          callback(new Error("两次密码不一致"));
        } else {
          callback(); //不传参数直接调用，表示验证通过
        }
      },
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确", trigger: "blur" },
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    // { min: 6, max: 6, message: "Length should be 3 to 5", trigger: "blur" },不仅需要验证长度还需要验证类型
    { pattern: /^\d{6}$/, message: "验证码必须是6位数字", trigger: "blur" },
  ],
});

// 显示隐藏{对话框}
// 接收父组件传来的参数 / 在此组件中引用 props.showDialog
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  // 父组件中
  title: {
    type: String,
    // 默认值为空，接收父组件传来的值
    default: "",
  },
});
//  showDialog的值若有更改，子组件通知父组件更新 showDialog的值
const emit = defineEmits(["update:showDialog"]);

// 获取父组件传来的值/ props已经是全局对象
// 在你的例子中，showPwdDialog 是一个布尔值，用于控制对话框的显示状态。这个状态是由父组件 LoginView 管理的
// 子组件响应用户操作：当用户在子组件 PwdForm 中点击“取消”或“提交”按钮时，子组件需要改变对话框的显示状态。但是，由于状态是由父组件管理的，子组件不能直接修改这个状态
// update 事件的这个dialog的属性必须是从父组件传递过来的
// 上方点击"取消"按钮的时候就触发了setter，因为它设置的是dialogVisible的值；
const dialogVisible = computed({
  // 获取props传来的dialog
  get: () => props.showDialog,
  set: (val) => {
    emit("update:showDialog", val);
  },
});

/**
 // # 教学视频暂未涉及    1.已有账号才能进行修改的逻辑 2.该表单页的数据关闭表单后仍未结束验证码的倒计时，如何重置
 * 提交表单
 * 用手机号重置密码
 * @param formEl
 */
const submitForm = async (formEl) => {
  if (!formEl) return;
  // await 用于等待表单验证 (formEl.validate) 的结果
  // validate 方法接受一个回调函数来处理验证结果
  // fields 参数是 Element Plus 表单验证回调函数中的第二个参数，
  // 它包含了表单验证失败时的错误信息。当表单验证失败时（valid 为 false），fields 对象会包含每个验证失败的表单项及其对应的错误信息。
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 提交成功后，隐藏窗口 / 隐藏窗口
      // 因为dia..是 ，这个赋值会触发set方法，set会将这个值传递会给父组件
      // 当你在计算属性中使用 get 和 set 方法时，Vue 会自动管理这些属性的读取和设置
      // get 方法：当读取计算属性的值时，Vue 会调用 get 方法
      // set 方法：当设置计算属性的值时，Vue 会调用 set 方法
      // 具体实现 数据格式验证通过之后 / 请求接口
      resetPwdByPhone({
        // 因为接口规定了传入这4个参数
        ...formModel,
      }).then((res) => {
        if (res.code == 1) {
          // 关闭重置对话框
          dialogVisible.value = false;
          ElMessage.success(res.msg || "重置密码成功");
        } else {
          ElMessage.error(res.msg || "重置密码失败");
        }
      });
    } else {
      console.log("error submit!", fields);
    }
  });
};

/**
 * 倒计时功能
 * 发送验证码倒计时功能
 */
const seconds = ref(0); // 初始化为0，请求验证码之后设置为60
let timer = null;
const sendSms = () => {
  // 用正则判断手机格式
  if (!/^1[3-9]\d{9}$/.test(formModel.phone)) {
    // 短信验证再单独再验证一层手机号格式：表单验证是在表单提交时进行的，而发送验证码是一个独立的操作，发生在表单提交之前
    // 这里若未验证，则可能出现错误；例如手机号未填写就可以发送验证码
    ElMessage.error("手机号格式错误");
    return;
  }
  // 使用对象传递参数是一种常见且推荐的做法
  // resetPwdSms(formModel.code).then(res=>{})
  resetPwdSms({
    phone: formModel.phone,
  }).then((res) => {
    if (res.code == 1) {
      // 发送验证码的请求成功之后，才开始倒计时
      seconds.value = 60;
      // 使用 setInterval 启动一个新的定时器，每秒执行一次回调函数
      timer && clearInterval(timer); // 清除之前的定时器（如果有）,防止多次点击按钮时产生多个定时器
      // 因为点击之后，setInterval 就会启动定时器,使按钮在60s内不可用，60s之后就可使用了
      timer = setInterval(() => {
        seconds.value--; // 每间隔1秒，-1
        if (seconds.value == 0) {
          // 当倒计时结束时，清除定时器，seconds数据发生变化，按钮恢复可用
          clearInterval(timer);
        }
      }, 1000); // 定时器的引用
      ElMessage.success(res.msg || "验证码发送成功");
    } else {
      ElMessage.error(res.msg || "验证码发送失败");
    }
  }); //end-then
}; //end-sendSms

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
