import { request } from "./requests";
import type { HelpDetail } from "@/types";
import { API } from "./api";

export async function getTeacherHelpList() {
  return request.get<{ details: HelpDetail[] }>(API.help.teacherList);
}
export async function submitHelp(data: Partial<HelpDetail>) {
  return request.post(API.help.studentSubmit, data);
}
