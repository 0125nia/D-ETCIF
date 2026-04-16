import { request } from "@/services/requests";
import { API } from "@/services/api";
import type { FeedbackItem } from "@/types/feedback";

export async function getStudentFeedbackList() {
  return request.get<FeedbackItem[]>(API.student.feedback.list);
}
