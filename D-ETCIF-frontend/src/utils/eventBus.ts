// 纯局部事件总线，无任何全局状态
type Callback = (data: any) => void;

const eventBus = {
  events: {} as Record<string, Callback[]>,

  // 订阅事件
  on(event: string, callback: Callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },

  // 发布事件
  emit(event: string, data?: any) {
    this.events[event]?.forEach((cb) => cb(data));
  },

  // 取消订阅（防止内存泄漏）
  off(event: string, callback: Callback) {
    this.events[event] = this.events[event]?.filter((cb) => cb !== callback);
  },
};

export default eventBus;
