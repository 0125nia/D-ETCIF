import Card from "@/components/common/Card";
import LowConfidence from "./LowConfidence";
import HighFrequencyError from "./HighFrequencyError";

export default function PreWarning() {
  return (
    <Card title="预警系统" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
        {/* 左侧: 低置信度学生 top */}
        <LowConfidence />

        {/* 右侧: 高频错误点 top */}
        <HighFrequencyError />
      </div>
    </Card>
  );
}
