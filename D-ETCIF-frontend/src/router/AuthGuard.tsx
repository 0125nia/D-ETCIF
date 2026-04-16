// Package router
// D-ETCIF-frontend/src/router/AuthGuard.tsx
import { useAuthStore } from "@/store";
import { toast } from "@/store";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

export function AuthGuard({
  allowRole,
}: {
  allowRole?: "student" | "teacher";
}) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!token) {
      toast.error("请先登录");
    } else if (!role) {
      toast.error("用户信息失效，请重新登录");
    } else if (allowRole && role !== allowRole) {
      if (role === "student") {
        toast.error("权限不足，学生无法访问教师页面");
      } else if (role === "teacher") {
        toast.error("权限不足，教师请前往预览查看学生页面");
      }
    }
  }, [token, role, allowRole]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowRole && role !== allowRole) {
    if (role === "student") {
      return <Navigate to="/student/lab" replace />;
    }

    if (role === "teacher") {
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  return <Outlet />;
}
