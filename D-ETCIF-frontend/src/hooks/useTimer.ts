import { useRef, useState } from "react";

interface UseSimpleTimerReturn {
  start: () => void;
  stop: () => number | null;
  isRunning: boolean;
  lastDuration: number | null;
}

export const useSimpleTimer = (): UseSimpleTimerReturn => {
  const startTimeRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  const start = () => {
    if (startTimeRef.current !== null) {
      console.warn("Timer is already running. Restarting...");
    }
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setLastDuration(null); // 重置上次的结果
  };

  const stop = (): number | null => {
    if (startTimeRef.current === null) {
      return null; // 未开始计时
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;

    startTimeRef.current = null;
    setIsRunning(false);
    setLastDuration(duration);

    return duration;
  };

  return { start, stop, isRunning, lastDuration };
};
