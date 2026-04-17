// Package common
// D-ETCIF-frontend/src/components/common/CodeEditor.tsx
import { useAuthStore, useExperimentStore } from "@/store";
import { NOTEBOOK_BASE_URL, NOTEBOOK_PATH } from "@/services/api";

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
  const notebookBase = NOTEBOOK_BASE_URL.replace(/\/$/, "");
  const notebookPath = NOTEBOOK_PATH
    ? NOTEBOOK_PATH.startsWith("/")
      ? NOTEBOOK_PATH
      : `/${NOTEBOOK_PATH}`
    : "";
  const notebookUrl =
    notebookBase && notebookPath
      ? `${notebookBase}${notebookPath}?${params.toString()}`
      : null;

  return (
    <div className="h-screen w-full">
      {notebookUrl ? (
        <iframe src={notebookUrl} className="w-full h-full border-none" title="notebook" />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          Notebook 地址未配置，请联系管理员设置环境变量。
        </div>
      )}
    </div>
  );
}
