import { get, post } from "@/utils/request";

export function getDatas() {
  return get({
    url: "/dashboard/datas",
  });
}

export function getWeekDatas() {
  return get({
    url: "/dashboard/weekdatas",
  });
}
export function getContentDatas() {
  return get({
    url: "/dashboard/contentdatas",
  });
}
