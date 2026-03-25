import { useAuthStore, useExperimentStore } from "@/store";

export default function CodeEditor() {
  const user = useAuthStore((state) => state.user);
  const currentExperimentId = useExperimentStore(
    (state) => state.currentExperimentId,
  );
  return (
    <div className="h-screen w-full">
      <iframe
        src={`http://localhost:8888/lab/tree/ipynb/test.ipynb?studentId=${user.id}&experimentId=${currentExperimentId}`}
        className="w-full h-full border-none"
        title="notebook"
      />
    </div>
  );
}
