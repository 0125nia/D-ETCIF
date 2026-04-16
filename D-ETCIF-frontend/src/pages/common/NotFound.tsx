// Package common
// D-ETCIF-frontend/src/pages/common/NotFound.tsx
import { useNavigate } from "react-router-dom";
import AnimatedPage from "@/components/common/AnimatedPage";
import { useAuthStore } from "@/store";

export default function NotFound() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);

  const goBack = () => {
    // 逻辑：优先回自己的主页，没登录回登录页
    if (role === "student") navigate("/student/lab");
    else if (role === "teacher") navigate("/teacher/dashboard");
    else navigate("/login");
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        {/* 404 数字：使用了半透明和渐变，不那么刺眼 */}
        <div className="relative">
          <h1 className="text-[12rem] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-medium text-gray-800 w-full text-center">
            Something's Missing
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-400 max-w-xs mx-auto">
            看来我们探索到了地图之外的区域
          </p>
        </div>
        {/* 按钮：带有一点阴影和缩放动效 */}
        <button
          onClick={goBack}
          className="mt-10 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all active:scale-95 shadow-lg flex items-center gap-2"
        >
          <span>←</span> Bring me back to home
        </button>
        {/* 底部点缀 */}
        <footer className="absolute bottom-8 text-[12px] text-gray-300 uppercase tracking-widest">
          乘骐骥以驰骋兮，来吾道夫先路 • {new Date().getFullYear()}
        </footer>
      </div>
    </AnimatedPage>
  );
}
