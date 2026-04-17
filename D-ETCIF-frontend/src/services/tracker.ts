// Package services
// D-ETCIF-frontend/src/services/tracker.ts
import { request } from "./requests";
import { toast } from "@/store";

export interface PreEventPayload {
  experiment_id: string;
  resource_id: string;
  resource_name: string;
  path: string;
  duration: number; // 毫秒
}

export interface MidEventPayload {
  experiment_id: string;
  action_type: string;
  content: string;
  duration: number; // 毫秒
}

export interface PostEventPayload {
  experiment_id: string;
  action_type: string;
  score: number;
  content: string;
}

interface TrackerResponse {
  message?: string;
  accepted?: boolean;
  reason?: string;
}

const DROP_TOAST_COOLDOWN_MS = 8000;
let lastDropToastAt = 0;

const handleTrackerResponse = (
  kind: "pre" | "mid" | "post",
  res: { code: number; message: string; data: unknown },
) => {
  const payload = (res.data ?? {}) as TrackerResponse;
  if (payload.accepted === false) {
    const reason = payload.reason || payload.message || "unspecified";
    console.warn(`[tracker:${kind}] event dropped`, { reason, payload });

    const now = Date.now();
    if (now - lastDropToastAt > DROP_TOAST_COOLDOWN_MS) {
      toast.warning("部分学习行为未被计入（系统已自动过滤无效埋点）");
      lastDropToastAt = now;
    }
  }

  return res;
};

export const trackPreEvent = (data: PreEventPayload) => {
  return request
    .post<{
      code: number;
      message: string;
      data: unknown;
    }>("/api/student/tracker/pre", data)
    .then((res) => handleTrackerResponse("pre", res));
};

export const trackMidEvent = (data: MidEventPayload) => {
  return request
    .post<{
      code: number;
      message: string;
      data: unknown;
    }>("/api/student/tracker/mid", data)
    .then((res) => handleTrackerResponse("mid", res));
};

export const trackPostEvent = (data: PostEventPayload) => {
  return request
    .post<{
      code: number;
      message: string;
      data: unknown;
    }>("/api/student/tracker/post", data)
    .then((res) => handleTrackerResponse("post", res));
};
