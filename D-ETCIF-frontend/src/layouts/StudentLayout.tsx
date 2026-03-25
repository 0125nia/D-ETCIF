import { TopNav, HelpModal } from "@/components/base";
import { Outlet } from "react-router-dom";
import { useUIStore } from "@/store/";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function StudentLayout() {
  const { helpModalOpen, setHelpModalOpen } = useUIStore();
  // 核心：在根布局挂载 WS，实现全模块“伴随式”监控
  // 传入 studentId (确保登录后有此信息)
  useWebSocket();
  return (
    <div>
      <TopNav />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <Outlet />
    </div>
  );
}
