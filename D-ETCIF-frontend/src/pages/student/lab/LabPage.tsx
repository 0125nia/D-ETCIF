// Package lab
// D-ETCIF-frontend/src/pages/student/lab/LabPage.tsx
import { PageContainer, Card } from "@/components/common";
import { useState } from "react";
import { useExperimentStore } from "@/store/experiment.store";
import { enterExperiment } from "@/services/experiment";
import { useNavigate } from "react-router-dom";
import { getExperimentList, getExperimentStages } from "@/services/experiment";
import { useEffect } from "react";
import type {
  ExperimentWithStage,
  Stage,
  UserExperimentStage,
} from "@/types/experiment";
import { toast } from "@/store";

const difficultyMap: Record<number, string> = {
  1: "入门",
  2: "基础",
  3: "中等",
  4: "困难",
};

const stageTextMap: Record<Stage, string> = {
  PRE: "实验前",
  DOING: "实验中",
  POST: "实验后",
};

export default function LabPage() {
  const [experiments, setExperiments] = useState<ExperimentWithStage[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // 全局状态
  const { enterExperiment: storeEnter } = useExperimentStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 同时请求两个接口（最符合你需求）
        const [expData, stageData] = await Promise.all([
          getExperimentList(),
          getExperimentStages(),
        ]);

        // 确保 expData 是数组
        const expList = Array.isArray(expData) ? expData : [];
        const stageList: UserExperimentStage[] = stageData;

        // 合并数据 → 只用于展示，不存多余状态
        const merged = expList.map((exp) => {
          const stageItem = stageList.find(
            (s) => s.experiment_id === exp.experiment_id,
          );
          const stage: Stage =
            stageItem?.current_stage === "PRE" ||
            stageItem?.current_stage === "DOING" ||
            stageItem?.current_stage === "POST"
              ? stageItem.current_stage
              : "PRE";
          return {
            ...exp,
            stage,
          } as ExperimentWithStage;
        });

        setExperiments(merged);
      } catch (err) {
        console.error("加载实验失败", err);
        toast.error("加载实验失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEnter = async (exp: ExperimentWithStage) => {
    try {
      // 1. 调用 enter 接口，获取当前阶段
      const response = await enterExperiment(exp.experiment_id);
      console.log("Enter experiment response:", response);

      // 处理不同的响应格式
      let currentStage = exp.stage;
      if (response) {
        const stageNum = response.current_stage;

        // 将数字类型的阶段转换为Stage类型
        if (stageNum) {
          if (stageNum === 1) {
            currentStage = "PRE";
          } else if (stageNum === 2) {
            currentStage = "DOING";
          } else if (stageNum === 3) {
            currentStage = "POST";
          }
        }
      }
      console.log("Current stage:", currentStage);

      // 2. 更新全局状态，传入实际的阶段
      storeEnter(exp.experiment_id, currentStage);

      // 3. 根据当前阶段 → 跳对应页面
      if (currentStage === "PRE") {
        navigate(`/student/lab/pre/${exp.experiment_id}`);
      } else if (currentStage === "DOING") {
        navigate(`/student/lab/doing/${exp.experiment_id}`);
      } else if (currentStage === "POST") {
        navigate(`/student/lab/post/${exp.experiment_id}`);
      }
    } catch (err) {
      console.error("进入实验失败", err);
      toast.error("进入实验失败，请稍后重试。");
    }
  };

  if (loading) {
    return <PageContainer title="">加载实验中...</PageContainer>;
  }

  return (
    <PageContainer title="实验列表">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experiments.map((exp) => (
          <Card key={exp.id} title={exp.name}>
            <div className="bg-white rounded-xl p-5 flex flex-col gap-3 h-full">
              <p className="text-sm text-gray-500">{exp.desc}</p>

              <div className="text-sm text-gray-600">
                难度：{difficultyMap[exp.difficulty]}
              </div>

              <div className="text-sm font-medium text-indigo-600">
                进度：{stageTextMap[exp.stage]}
              </div>

              <button
                onClick={() => handleEnter(exp)}
                className="mt-auto bg-indigo-500 text-white rounded px-3 py-2 hover:bg-indigo-600"
              >
                进入实验
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
