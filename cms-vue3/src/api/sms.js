import { get, post } from "@/utils/request";

/**
 * @param {*} data :需要发送给服务器的数据 此处未规定数据类型但传参的时候最好使用obj
 * @returns post(obj)
 */
export const resetPwdSms = (data) => {
  return post({
    url: "/sms/pwd",
    data: data,
  });
};
