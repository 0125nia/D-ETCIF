import { create } from "zustand";

// 单个计时器数据类型
interface TimerItem {
  startTime: number | null;
  elapsedTime: number;
  isRunning: boolean;
}

interface TimerStore {
  timers: Record<string, TimerItem>;

  start: (name?: string) => void;
  stop: (name?: string) => void;
  continue: (name?: string) => void;
  getTime: (name?: string) => number;
  reset: (name?: string) => void;
}

const DEFAULT_NAME = "default";

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: {},

  // 开始计时
  start: (name = DEFAULT_NAME) => {
    set((state) => ({
      timers: {
        ...state.timers,
        [name]: {
          startTime: Date.now(),
          elapsedTime: 0,
          isRunning: true,
        },
      },
    }));
  },

  // 暂停
  stop: (name = DEFAULT_NAME) => {
    const { timers } = get();
    const timer = timers[name];
    if (!timer || !timer.isRunning) return;

    const now = Date.now();
    const elapsed = timer.elapsedTime + (now - (timer.startTime || 0));

    set((state) => ({
      timers: {
        ...state.timers,
        [name]: { ...timer, elapsedTime: elapsed, startTime: null, isRunning: false },
      },
    }));
  },

  // 继续
  continue: (name = DEFAULT_NAME) => {
    const { timers } = get();
    const timer = timers[name];
    if (!timer || timer.isRunning) return;

    set((state) => ({
      timers: {
        ...state.timers,
        [name]: { ...timer, startTime: Date.now(), isRunning: true },
      },
    }));
  },

  // 获取总毫秒数（调用时才计算，不自动更新）
  getTime: (name = DEFAULT_NAME): number => {
    const { timers } = get();
    const timer = timers[name];
    if (!timer) return 0;

    if (timer.isRunning && timer.startTime) {
      return timer.elapsedTime + (Date.now() - timer.startTime);
    }
    return timer.elapsedTime;
  },

  // 重置
  reset: (name = DEFAULT_NAME) => {
    set((state) => {
      const t = { ...state.timers };
      delete t[name];
      return { timers: t };
    });
  },
}));

// 全局直接调用的工具（你要的语法）
export const timer = {
  start: (name?: string) => useTimerStore.getState().start(name),
  stop: (name?: string) => useTimerStore.getState().stop(name),
  continue: (name?: string) => useTimerStore.getState().continue(name),
  getTime: (name?: string) => useTimerStore.getState().getTime(name),
  reset: (name?: string) => useTimerStore.getState().reset(name),
};