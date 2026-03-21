import { useEffect } from "react";
import { useToastStore } from "@/store";

export default function Toast() {
  const { message, type, isVisible, hide } = useToastStore();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(hide, 3000); // 3秒后自动消失
      return () => clearTimeout(timer);
    }
  }, [isVisible, hide]);

  if (!isVisible) return null;

  const style: Record<typeof type, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
  };

  const icon = type === "error" ? "✖" : type === "warning" ? "!" : "✓";

  return (
    <div
      className={`
        fixed top-6 right-6 z-[9999]
        px-6 py-3 text-white rounded-lg shadow-2xl
        transition-all duration-300 transform
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        ${style[type]}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
