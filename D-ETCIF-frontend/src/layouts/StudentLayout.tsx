import { TopNav, HelpModal } from "@/components/base";
import { Outlet } from "react-router-dom";
import { useUIStore } from "@/store/";

export default function StudentLayout() {
  const { helpModalOpen, setHelpModalOpen } = useUIStore();
  return (
    <div>
      <TopNav />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <Outlet />
    </div>
  );
}
