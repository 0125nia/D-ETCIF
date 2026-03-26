import { useEffect } from "react";
import PageContainer from "@/components/common/PageContainer";
import CognitiveMap from "@/components/student/profile/CognitiveMap";
import ResourceRecommend from "@/components/student/profile/ResourceRecommend";
import StudyReport from "@/components/student/profile/StudyReport";
import { useProfileStore } from "@/store/profile.store";

export default function ProfilePage() {
  const fetchProfileData = useProfileStore((s) => s.fetchProfileData);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">个人中心</h1>

      {/* 学习报告组件 */}
      <StudyReport />

      {/* 认知图谱 + 推荐资源 横向布局（移动端自适应） */}

      <div className="flex flex-col md:flex-row gap-6">
        <CognitiveMap />
        <ResourceRecommend />
      </div>
    </PageContainer>
  );
}
