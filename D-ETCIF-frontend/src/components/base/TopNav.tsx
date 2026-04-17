// Package base
// D-ETCIF-frontend/src/components/base/TopNav.tsx
import { useAuthStore } from "@/store";
import { useHelpModal } from "@/app/ui/useHelpModal";
import { cn } from "@/utils/cn";
import type { StudentNav, TeacherNav, ActiveNav } from "@/types/nav";
import { useNavigate } from "react-router-dom";
import StageTag from "./StageTag";

const TopNav = () => {
  const { activeNav, setNav, user, role } = useAuthStore();
  const { open: openHelpModal } = useHelpModal();
  const navigate = useNavigate();

  const studentNav: { key: StudentNav; label: string }[] = [
    { key: "experiment", label: "实验中心" },
    { key: "feedback", label: "反馈记录" },
    { key: "profile", label: "个人中心" },
    { key: "help", label: "求助" },
  ];

  const teacherNav: { key: TeacherNav; label: string }[] = [
    { key: "dashboard", label: "教学看板" },
    { key: "helpManage", label: "求助管理" },
    { key: "correct", label: "实验批改" },
  ];

  const navList = role === "student" ? studentNav : teacherNav;

  const navRouteMap: Record<ActiveNav, string> = {
    experiment: "/student/lab",
    feedback: "/student/feedback",
    profile: "/student/profile",
    help: "", // 学生求助通过弹窗，不跳转路由
    dashboard: "/teacher/dashboard",
    helpManage: "/teacher/help",
    correct: "/teacher/correct",
  };

  const handleClick = (key: ActiveNav) => {
    setNav(key);
    if (role === "student" && key === "help") {
      openHelpModal();
      return;
    }

    navigate(navRouteMap[key]);
  };

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5">
      <div className="flex items-center">
        <span className="text-xl font-bold text-blue-600">D-ETCIF</span>
      </div>
      <div className="flex gap-8">
        {navList.map((item) => (
          <button
            key={item.key}
            onClick={() => handleClick(item.key)}
            className={cn(
              "text-base pb-2 border-b-2 transition-colors",
              activeNav === item.key
                ? "text-blue-500 border-blue-500 font-medium"
                : "text-gray-500 border-transparent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <StageTag />

      <div className="flex items-center gap-2">
        <div className="text-gray-800 text-sm">
          {user?.user_number || "加载中..."} | {user?.name || ""}
        </div>
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
          <img
            src="/profile.png"
            alt="头像"
            className="w-5 h-5 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default TopNav;
