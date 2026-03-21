import { useRoutes } from "react-router-dom";
import routes from "@/router";
import Toast from "./components/common/Toast";
import { AnimatePresence } from "framer-motion";
import React from "react";

export default function App() {
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
