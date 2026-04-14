// Package help
// D-ETCIF-frontend/src/components/teacher/help/HelpMain.tsx
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import type { HelpDetail } from "@/types";

interface Props {
  data: HelpDetail | null;
  onRefresh: () => void;
}

export default function HelpMain({ data, onRefresh }: Props) {
  if (!data) {
    return (
      <Card className="h-full flex items-center justify-center text-gray-400">
        请在左侧选择一个求助项进行查看
      </Card>
    );
  }

  return (
    <Card title="求助详情内容" className="h-full flex flex-col shadow-lg">
      <div className="flex-1 space-y-6">
        {/* 顶部标题与元数据 */}
        <div className="border-b pb-4">
          <div className="text-2xl font-bold text-slate-800 mb-2">
            {data.title}
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <span className="font-semibold text-slate-600">提问学生:</span> #
              {data.user_id}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="font-semibold text-slate-600">所属实验:</span>{" "}
              {data.experiment_id}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <span className="font-semibold text-slate-600">实验环节:</span>
              <span className="text-blue-600 font-medium">
                {data.experiment_stage}
              </span>
            </div>
          </div>
        </div>

        {/* 核心内容 */}
        <div>
          <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            问题描述
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">
            {data.content}
          </div>
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="mt-8 pt-6 border-t flex justify-end gap-3">
        <Button variant="ghost" onClick={onRefresh}>
          刷新状态
        </Button>
        <Button variant="primary" className="px-8">
          标记为已解决
        </Button>
      </div>
    </Card>
  );
}
