// 勾选记住密码功能，将用户输入信息保存到token中并相应操作
const Key = "admin_uname_pwd";

// 获取 token
export function getUnamePwd() {
  let info = localStorage.getItem(Key);
  if (info) {
    // 将json转换为对象
    let infoObj = JSON.parse(info);
    infoObj.pwd = atob(infoObj.pwd);
    return infoObj;
  }
  return null;
}

/**
 * 用户勾选记住密码，则将所填的name、pwd保存到token中
 * @param {*} info formmodel 对象 
 */
export function setUnamePwd(info) {
  info.pwd = btoa(info.pwd);  // 密码保存的时候转换为非明文显示
  info = JSON.stringify(info);
  localStorage.setItem(Key, info);
}

// 删除 token
export function removeUnamePwd() {
  localStorage.removeItem(Key);
}
