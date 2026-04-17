// Package profile
// D-ETCIF-frontend/src/pages/student/profile/ProfilePage.tsx
import { useEffect, useState } from "react";
import PageContainer from "@/components/common/PageContainer";
import CognitiveMap from "@/components/student/profile/CognitiveMap";
import ResourceRecommend from "@/components/student/profile/ResourceRecommend";
import StudyReport from "@/components/student/profile/StudyReport";
import {
  getCognitiveMap,
  getStudyReport,
  getRecommendations,
} from "@/services";
import type {
  CognitiveMapData,
  StudyReportData,
  ResourceRecommendation,
} from "@/types";

export default function ProfilePage() {
  const [report, setReport] = useState<StudyReportData | null>(null);
  const [mapData, setMapData] = useState<CognitiveMapData | null>(null);
  const [recommendations, setRecommendations] = useState<
    ResourceRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resMap, resReport, resRec] = await Promise.all([
          getCognitiveMap(),
          getStudyReport(),
          getRecommendations(),
        ]);
        setMapData(resMap);
        setReport(resReport);
        setRecommendations(resRec);
      } catch (err) {
        console.error("Profile data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">个人中心</h1>

      <StudyReport data={report} loading={loading} />

      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-1/2 flex-none">
          <CognitiveMap data={mapData} loading={loading} />
        </div>
        <div className="w-full md:w-1/2 flex-none">
          <ResourceRecommend data={recommendations} loading={loading} />
        </div>
      </div>
    </PageContainer>
  );
}
