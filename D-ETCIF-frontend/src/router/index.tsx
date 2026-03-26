import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
// import { AuthGuard } from "./AuthGuard";

import { StudentLayout, TeacherLayout } from "@/layouts";

import {
  LabPage,
  PreStagePage,
  DoingStagePage,
  PostStagePage,
  ProfilePage,
  FeedbackPage,
} from "@/pages/student";

import { Dashboard, Correct, HelpPage } from "@/pages/teacher";

import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/common/NotFound";
import KnowledgeDetailPage from "@/pages/common/KnowledgeDetailPage";
import Test from "@/pages/common/Test";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/knowledge/:name",
    element: <KnowledgeDetailPage />,
  },

  // student模块
  {
    path: "/student",
    // element: <AuthGuard allowRole="student" />,
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
            children: [
              {
                index: true,
                element: <LabPage />,
              },
              {
                // path: ":labId/pre",
                path: "pre",
                element: <PreStagePage />,
              },
              {
                // path: ":labId/doing",
                path: "doing",
                element: <DoingStagePage />,
              },
              {
                // path: ":labId/post",
                path: "post",
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
    // element: <AuthGuard allowRole="teacher" />,
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
          {
            path: "correct",
            element: <Correct />,
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
