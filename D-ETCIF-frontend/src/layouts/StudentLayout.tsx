// Package layouts
// D-ETCIF-frontend/src/layouts/StudentLayout.tsx
import { TopNav, HelpModal } from "@/components/base";
import { Outlet } from "react-router-dom";
import { useHelpModal } from "@/app/ui/useHelpModal";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function StudentLayout() {
  const { helpModalOpen, close } = useHelpModal();
  // 核心：在根布局挂载 WS，实现全模块“伴随式”监控
  // 传入 studentId (确保登录后有此信息)
  useWebSocket();
  return (
    <div>
      <TopNav />
      <HelpModal open={helpModalOpen} onClose={close} />
      <Outlet />
    </div>
  );
}
