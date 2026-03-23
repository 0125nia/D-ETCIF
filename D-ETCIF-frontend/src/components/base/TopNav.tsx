import { useGlobalStore } from "@/store/useGlobalStore";
import type { StudentNav, TeacherNav, ActiveNav } from "@/types/domain/global";
import { useNavigate } from "react-router-dom";
import StageTag from "./StageTag";

const TopNav = () => {
  const { activeNav, setActiveNav, userInfo, setHelpModalOpen } =
    useGlobalStore();
  const role = userInfo.role;
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
  ];

  const navList = role === "student" ? studentNav : teacherNav;

  const navRouteMap: Record<ActiveNav, string> = {
    experiment: "/student/lab",
    feedback: "/student/feedback",
    profile: "/student/profile",
    help: "", // 学生求助通过弹窗，不跳转路由
    dashboard: "/teacher/dashboard",
    helpManage: "/teacher/help",
  };

  const handleClick = (key: ActiveNav) => {
    setActiveNav(key);

    // ⭐ 学生求助 → 弹窗
    if (role === "student" && key === "help") {
      setHelpModalOpen(true);
      return;
    }

    navigate(navRouteMap[key]);
  };

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5">
      <div className="flex gap-8">
        {navList.map((item) => (
          <button
            key={item.key}
            onClick={() => handleClick(item.key)}
            className={`text-base pb-2 border-b-2 transition-colors ${
              activeNav === item.key
                ? "text-blue-500 border-blue-500 font-medium"
                : "text-gray-500 border-transparent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <StageTag />

      <div className="text-gray-800 text-sm">
        {userInfo.id || "加载中..."} | {userInfo.name || ""}
      </div>
    </div>
  );
};

export default TopNav;
