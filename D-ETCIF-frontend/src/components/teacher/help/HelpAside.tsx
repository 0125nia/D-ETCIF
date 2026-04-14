// Package help
// D-ETCIF-frontend/src/components/teacher/help/HelpAside.tsx
import List from "@/components/common/List";
import type { HelpDetail } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  list: HelpDetail[];
  activeId?: number;
  onSelect: (item: HelpDetail) => void;
  loading: boolean;
}

export default function HelpAside({
  list,
  activeId,
  onSelect,
  loading,
}: Props) {
  if (loading) return <div className="p-4 text-gray-400">加载中...</div>;

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-semibold mb-4 text-slate-700 flex justify-between">
        求助列表
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
          {list.length}
        </span>
      </h2>

      <div className="flex-1 overflow-y-auto">
        <List
          data={list}
          renderItem={(item: HelpDetail) => (
            <div
              onClick={() => onSelect(item)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                activeId === item.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "hover:bg-gray-50 text-gray-600",
              )}
            >
              <div className="font-medium text-sm truncate">{item.title}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  ID: {item.user_id}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  阶段 {item.experiment_stage}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
