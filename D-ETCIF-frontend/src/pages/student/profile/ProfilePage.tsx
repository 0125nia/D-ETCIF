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
    // 页面内部消化数据获取逻辑
    const loadData = async () => {
      try {
        const [resMap, resReport, resRec] = await Promise.all([
          getCognitiveMap(),
          getStudyReport(),
          getRecommendations(),
        ]);
        setMapData(resMap.data.data);
        setReport(resReport.data.data);
        setRecommendations(resRec.data.data);
      } catch (err) {
        console.error("Profile data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       setLoading(true);

  //       // 模拟网络延迟
  //       await new Promise((resolve) => setTimeout(resolve, 800));

  //       // 构造符合原子化接口契约的 Mock 数据
  //       const mockMap = {
  //         data: {
  //           data: {
  //             nodes: [
  //               { id: "stu_001", name: "当前学生", expid: 0, type: "Student" },
  //               {
  //                 id: "kp_1",
  //                 name: "Pandas基础",
  //                 expid: 1,
  //                 type: "KnowledgePoint",
  //               },
  //               {
  //                 id: "kp_2",
  //                 name: "Matplotlib绘图",
  //                 expid: 2,
  //                 type: "KnowledgePoint",
  //               },
  //               {
  //                 id: "kp_3",
  //                 name: "数据清洗",
  //                 expid: 1,
  //                 type: "KnowledgePoint",
  //               },
  //               {
  //                 id: "kp_4",
  //                 name: "坐标轴定制",
  //                 expid: 2,
  //                 type: "KnowledgePoint",
  //               },
  //             ],
  //             links: [
  //               { source: "stu_001", target: "kp_1", value: 0.8 },
  //               { source: "stu_001", target: "kp_2", value: 0.6 },
  //               { source: "kp_1", target: "kp_3", value: 0.9 },
  //               { source: "kp_2", target: "kp_4", value: 0.7 },
  //             ],
  //           },
  //         },
  //       };

  //       const mockReport = {
  //         data: {
  //           data: {
  //             total_time: 125,
  //             total_exp: 4,
  //             error_rate: 12.5,
  //             average_score: 88,
  //           },
  //         },
  //       };

  //       const mockRecs = {
  //         data: {
  //           data: [
  //             {
  //               id: 101,
  //               name: "深入浅出 Pandas 数据分析",
  //               link: "https://example.com/pandas",
  //             },
  //             {
  //               id: 102,
  //               name: "Matplotlib 官方精选案例展示",
  //               link: "https://example.com/plt",
  //             },
  //             {
  //               id: 103,
  //               name: "Python 异常处理最佳实践",
  //               link: "https://example.com/error-handle",
  //             },
  //           ],
  //         },
  //       };

  //       // 模拟赋值流程
  //       setMapData(mockMap.data.data);
  //       setReport(mockReport.data.data);
  //       setRecommendations(mockRecs.data.data);
  //     } catch (err) {
  //       console.error("Profile data fetch failed", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadData();
  // }, []);

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
