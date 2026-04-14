// Package services
// D-ETCIF-frontend/src/services/tracker.ts
import { request } from "./requests";

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

export const trackPreEvent = (data: PreEventPayload) => {
  return request.post("/api/student/tracker/pre", data);
};

export const trackMidEvent = (data: MidEventPayload) => {
  return request.post("/api/student/tracker/mid", data);
};

export const trackPostEvent = (data: PostEventPayload) => {
  return request.post("/api/student/tracker/post", data);
};
