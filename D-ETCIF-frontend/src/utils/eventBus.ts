// Package utils
// D-ETCIF-frontend/src/utils/eventBus.ts
type Callback<T> = (data: T) => void;

class EventBus<Events extends Record<string, unknown>> {
  private events: { [K in keyof Events]?: Array<Callback<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, callback: Callback<Events[K]>) {
    const list = this.events[event] ?? [];
    list.push(callback);
    this.events[event] = list;
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.events[event]?.forEach((cb) => cb(data));
  }

  off<K extends keyof Events>(event: K, callback: Callback<Events[K]>) {
    this.events[event] = this.events[event]?.filter((cb) => cb !== callback);
  }
}

// 如需扩展事件类型，在这里增加即可
export type AppEvents = {
  // 键是事件名，值是 emit 时需要传递的数据类型
  examScoreUpdate: {
    score: number | null;
    completed: boolean;
  };

  // 以后有其他事件也可以继续加在这里
  // "auth:logout": undefined;
};

const eventBus = new EventBus<AppEvents>();
export default eventBus;
