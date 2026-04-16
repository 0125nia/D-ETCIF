// Package ui
// D-ETCIF-frontend/src/app/ui/useHelpModal.ts
import {  useUIStore } from "@/store";

// use-case：打开/关闭求助弹窗 + 触发埋点
export function useHelpModal() {
  const helpModalOpen = useUIStore((s) => s.helpModalOpen);
  const setHelpModalOpen = useUIStore((s) => s.setHelpModalOpen);
  // const expId = useExperimentStore((s) => s.currentExperimentId);

  const open = () => {
    setHelpModalOpen(true);

    // trackMidEvent({
    //   experiment_id: expId ? expId.toString() : "unknown",
    //   action_type: "help_trigger",
    //   content: "用户打开了求助弹窗",
    //   duration: 0,
    // }).catch(console.error);
  };

  const close = () => setHelpModalOpen(false);

  return { helpModalOpen, open, close };
}
