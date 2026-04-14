// Package dashboard
// D-ETCIF-frontend/src/components/teacher/dashboard/PreWarning.tsx
import Card from "@/components/common/Card";
import LowConfidence from "./LowConfidence";
import HighFrequencyError from "./HighFrequencyError";
import type { WarningData } from "@/types/dashboard";

interface Props {
  data: WarningData | null;
  loading: boolean;
}

export default function PreWarning({ data, loading }: Props) {
  return (
    <Card title="预警系统" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        <LowConfidence data={data?.lowConfidence || []} loading={loading} />
        <HighFrequencyError
          data={data?.highFrequencyError || []}
          loading={loading}
        />
      </div>
    </Card>
  );
}
