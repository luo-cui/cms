// 密码校验规则 场景: 设置密码、重置密码
// 指定的特殊字符（@$!%*?&）
export const pwdRules = [
  { required: true, message: "请输入密码", trigger: "blur" },
  {
    min: 6,
    max: 30,
    message: "密码的长度至少是6位，最多是30位",
    trigger: "blur",
  },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,30}$/,
    message: "密码必须包含大小写字母、数字和指定特殊字符",
    trigger: "blur",
  },
];
