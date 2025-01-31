import { get, post } from "@/utils/request";

export function login(data) {
  return post({
    url: "/user/login",
    data: data,
  });
}

export function resetPwdByPhone(data) {
  return post({
    url: "/user/resetpwd",
    data: data,
  });
}

export function getUserinfo() {
  return get({
    url: "/user/userinfo",
  });
}

export function userLogout() {
  return post({
    url: "/user/logout",
  });
}
