// Package services
// D-ETCIF-frontend/src/services/profile.ts
import { request } from "./requests";
import type {
  CognitiveMapData,
  StudyReportData,
  ResourceRecommendation,
} from "@/types";
import { API } from "./api";

export type CognitiveMapRes = { data: CognitiveMapData };
export type StudyReportRes = { data: StudyReportData };
export type ResourceRecommendationRes = { data: ResourceRecommendation[] };
export const getCognitiveMap = () => {
  return request.get<CognitiveMapRes>(API.student.profile.cognitiveMap);
};

export const getStudyReport = () => {
  return request.get<StudyReportRes>(API.student.profile.studyReport);
};

export const getRecommendations = () => {
  return request.get<ResourceRecommendationRes>(
    API.student.profile.recommendations,
  );
};
