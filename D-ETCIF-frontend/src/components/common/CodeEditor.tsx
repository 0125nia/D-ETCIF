// Package common
// D-ETCIF-frontend/src/components/common/CodeEditor.tsx
import { useAuthStore, useExperimentStore } from "@/store";

export default function CodeEditor() {
  const user = useAuthStore((state) => state.user);
  const currentExperimentId = useExperimentStore(
    (state) => state.currentExperimentId,
  );

  const studentId = user?.id ?? 0;
  const experimentId =
    currentExperimentId === null ? "" : String(currentExperimentId);

  const params = new URLSearchParams({
    studentId: String(studentId),
    experimentId,
  });

  return (
    <div className="h-screen w-full">
      <iframe
        src={`http://localhost:8888/lab/tree/ipynb/test.ipynb?${params.toString()}`}
        className="w-full h-full border-none"
        title="notebook"
      />
    </div>
  );
}