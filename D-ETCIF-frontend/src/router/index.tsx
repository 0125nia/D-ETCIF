import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";

import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/error/NotFound";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  // student模块
  {
    path: "/student",
    element: <AuthGuard allowRole="student" />,
    children: [
      {
        //   element: <StudentLayout />,
        //   children: [
        //     {
        //       index: true,
        //       element: <Navigate to="lab" replace />, // 自动跳转到 /student/lab
        //     },
        //     {
        //       path: "lab",
        //       element: <LabPage />,
        //     },
        //     {
        //       path: "lab/:id",
        //       element: <ExperimentWorkbench />,
        //     },
        //     {
        //       path: "dashboard",
        //       element: <StudentDashboard />,
        //     },
        //   ],
      },
    ],
  },

  //  teacher模块
  {
    path: "/teacher",
    element: <AuthGuard allowRole="teacher" />,
    children: [
      {
        //   element: <TeacherLayout />,
        //   children: [
        //     {
        //       index: true,
        //       element: <Navigate to="dashboard" replace />, // 自动跳转到 /teacher/dashboard
        //     },
        //     {
        //       path: "dashboard",
        //       element: <Dashboard />,
        //     },
        //   ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
