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
  const notebookBaseUrl = import.meta.env.VITE_NOTEBOOK_BASE_URL as
    | string
    | undefined;
  const notebookPath = import.meta.env.VITE_NOTEBOOK_PATH as string | undefined;
  const iframeSrc = notebookBaseUrl
    ? `${notebookBaseUrl.replace(/\/$/, "")}/${(notebookPath || "lab/tree/ipynb/test.ipynb").replace(/^\//, "")}?${params.toString()}`
    : "";

  return (
    <div className="h-screen w-full">
      {iframeSrc ? (
        <iframe src={iframeSrc} className="w-full h-full border-none" title="notebook" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          未配置 Notebook 地址，请设置 VITE_NOTEBOOK_BASE_URL
        </div>
      )}
    </div>
  );
}
