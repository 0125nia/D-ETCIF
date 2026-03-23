import TopNav from "@/components/base/TopNav";
import { Outlet } from "react-router-dom";
import { useGlobalStore } from "@/store/useGlobalStore";
import HelpModal from "@/components/base/HelpModal";

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
