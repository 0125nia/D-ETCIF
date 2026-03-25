import { useAuthStore, useExperimentStore } from "@/store";
const StageTag = () => {
  const { user } = useAuthStore();
  const { currentStage } = useExperimentStore();

  if (user.role === "teacher" || !currentStage) {
    return null;
  }

  const map = {
    PRE: "实验前",
    DOING: "实验中",
    POST: "实验后",
  };

  return (
    <div className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 font-medium">
      当前阶段: {map[currentStage]}
    </div>
  );
};

export default StageTag;
