// Package common
// D-ETCIF-frontend/src/components/common/Timer.tsx
import React from "react";
import { useSimpleTimer } from "@/hooks/useTimer"; // 假设上面代码存于此文件

const SimpleBehaviorTimer: React.FC = () => {
  const { start, stop, isRunning, lastDuration } = useSimpleTimer();

  // 场景 1: 模拟某个异步操作或用户行为开始
  const handleActionStart = () => {
    start();
    console.log("计时开始...");
  };

  // 场景 2: 用户完成输入 (例如：离开输入框)
  const handleInputBlur = () => {
    const time = stop();
    if (time !== null) {
      console.log(`行为结束 (输入完成)，耗时: ${time} ms`);
    }
  };

  // 场景 3: 点击按钮立即停止
  const handleManualStop = () => {
    const time = stop();
    if (time !== null) {
      alert(`计时停止！\n总耗时: ${time} 毫秒`);
    } else {
      alert('请先点击 "开始计时"');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-800">简易行为计时器</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={handleActionStart}
          disabled={isRunning}
          className={`px-4 py-2 rounded text-white transition-colors ${
            isRunning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRunning ? "计时中..." : "1. 开始计时"}
        </button>

        <button
          onClick={handleManualStop}
          disabled={!isRunning}
          className={`px-4 py-2 rounded text-white transition-colors ${
            !isRunning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          2. 手动停止
        </button>
      </div>

      {/* 场景演示：输入框失去焦点自动停止 */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          场景：在下方输入内容，然后点击外部 (blur) 自动停止计时
        </label>
        <input
          type="text"
          placeholder="先点击上方 '开始计时'，然后在此输入..."
          onFocus={isRunning ? undefined : start} // 可选：聚焦时自动开始
          onBlur={handleInputBlur}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={!isRunning && lastDuration === null} // 仅做视觉引导，实际逻辑由你控制
        />
      </div>

      {/* 结果显示 */}
      {lastDuration !== null && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <p className="font-semibold">上次耗时:</p>
          <p className="text-3xl font-mono">
            {lastDuration} <span className="text-sm">ms</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            (你可以在控制台查看详细的日志)
          </p>
        </div>
      )}

      {isRunning && (
        <div className="text-center text-blue-600 animate-pulse text-sm">
          正在记录时间...
        </div>
      )}
    </div>
  );
};

export default SimpleBehaviorTimer;
