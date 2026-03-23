import { TopNav, HelpModal } from "@/components/base";
import { Outlet } from "react-router-dom";
import { useGlobalStore } from "@/store/global.store";

export default function StudentLayout() {
  const { helpModalOpen, setHelpModalOpen } = useGlobalStore();
  return (
    <div>
      <TopNav />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <Outlet />
    </div>
  );
}
