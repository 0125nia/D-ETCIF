import { request } from "./requests";
import type { LoginRes } from "@/types/res/login";

export function loginApi(
  username: string,
  password: string,
  role: "student" | "teacher",
): Promise<LoginRes> {
  console.log("请求地址：/api/login，请求方法：POST");
  return request({
    method: "POST",
    url: "/api/login",
    data: { username, password, role },
  });
}
