import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";

import StudentLayout from "@/layouts/role/StudentLayout";
import LabPage from "@/pages/student/lab/LabPage";
import PreStagePage from "@/pages/student/stage/PreStagePage";
import DoingStagePage from "@/pages/student/stage/DoingStagePage";
import PostStagePage from "@/pages/student/stage/PostStagePage";
import FeedbackPage from "@/pages/student/feedback/FeedbackPage";
import ProfilePage from "@/pages/student/profile/ProfilePage";

import TeacherLayout from "@/layouts/role/TeacherLayout";
import Dashboard from "@/pages/teacher/dashborad/Dashborad";
import HelpPage from "@/pages/teacher/help/HelpPage";

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
        element: <StudentLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="lab" replace />,
          },
          {
            path: "lab",
            element: <LabPage />,
            children: [
              {
                path: ":labId/pre",
                element: <PreStagePage />,
              },
              {
                path: ":labId/doing",
                element: <DoingStagePage />,
              },
              {
                path: ":labId/post",
                element: <PostStagePage />,
              },
            ],
          },
          {
            path: "feedback",
            element: <FeedbackPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  //  teacher模块
  {
    path: "/teacher",
    element: <AuthGuard allowRole="teacher" />,
    children: [
      {
        element: <TeacherLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />, // 自动跳转到 /teacher/dashboard
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "help",
            element: <HelpPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
