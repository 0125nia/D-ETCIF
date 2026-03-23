import TopNav from "@/components/base/TopNav";
import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div>
      <TopNav />
      <Outlet />
    </div>
  );
}
