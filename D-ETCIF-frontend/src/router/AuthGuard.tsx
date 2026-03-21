import { toast } from "@/store";
import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard({
  allowRole,
}: {
  allowRole?: "student" | "teacher";
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    toast.error("请先登录");
    return <Navigate to="/login" replace />;
  }

  if (allowRole && role !== allowRole) {
    if (role === "student") {
      toast.error("权限不足，学生无法访问教师页面");
      return <Navigate to="/student/lab" replace />;
    }

    if (role === "teacher") {
      toast.error("权限不足，教师请前往预览查看学生页面");
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  return <Outlet />;
}
