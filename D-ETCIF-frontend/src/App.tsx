// Package src
// D-ETCIF-frontend/src/App.tsx
import { useRoutes } from "react-router-dom";
import routes from "@/router";
import Toast from "./components/common/Toast";
import { AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { useAuthStore } from "@/store";
import { useExperimentStore } from "@/store/experiment.store";
import { useAuthSession } from "@/app/auth/useAuthSession";

export default function App() {
  // 1) 启动时从 localStorage 初始化 auth store
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // 2) 启动时从 localStorage 初始化 experiment store
  const initExperimentFromStorage = useExperimentStore((s) => s.initFromStorage);
  useEffect(() => {
    initExperimentFromStorage();
  }, [initExperimentFromStorage]);

  // 3) 统一 401 会话处理
  useAuthSession();

  const element = useRoutes(routes);
  return (
    <>
      <Toast />
      {/* AnimatePresence 会追踪子元素的卸载，从而触发 exit 动画 */}
      <AnimatePresence mode="wait">
        {/* 给 element 绑定 key，让 Framer Motion 知道路由变了 */}
        {element && React.cloneElement(element, { key: location.pathname })}
      </AnimatePresence>
    </>
  );
}
