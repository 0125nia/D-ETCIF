// Package services
// D-ETCIF-frontend/src/services/profile.ts
import { request } from "./requests";
import type {
  CognitiveMapData,
  StudyReportData,
  ResourceRecommendation,
} from "@/types";
import { API } from "./api";

export const getCognitiveMap = () => {
  return request.get<CognitiveMapData>(API.student.profile.cognitiveMap);
};

export const getStudyReport = () => {
  return request.get<StudyReportData>(API.student.profile.studyReport);
};

export const getRecommendations = () => {
  return request.get<ResourceRecommendation[]>(
    API.student.profile.recommendations,
  );
};
