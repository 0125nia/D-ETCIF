import { request } from "./requests";
import type { CognitiveMapData } from "@/types/domain/profile";
import type { StudyReportData } from "@/types/domain/profile";


export const getCognitiveMap = (): Promise<{ data: CognitiveMapData }> => {
     return request.get<{ data: CognitiveMapData }>("/api/student/profile/cognitive-map").then(response => response.data);
};

export const getStudyReport = (): Promise<{ data: StudyReportData }> => {
  return request.get<{ data: StudyReportData }>("/api/student/profile/report").then(response => response.data)  ;
};
