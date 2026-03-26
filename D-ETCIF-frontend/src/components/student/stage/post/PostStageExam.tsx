// src/components/postStage/PostStageExam.tsx
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

// 答题页面组件
export default function PostStageExam() {
  return (
    <Card title="实验小测 - 答题区域" className="h-full">
      <div className="space-y-6">
        {/* 单选题示例 */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">1. 实验目的是？</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="q1" />
              A. 掌握数据采集方法
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="q1" />
              B. 完成设备调试
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="q1" />
              C. 其他
            </label>
          </div>
        </div>

        {/* 简答题示例 */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">2. 简述实验原理</h3>
          <textarea
            className="w-full border border-gray-200 rounded p-3 h-32 resize-none"
            placeholder="请输入答案..."
          />
        </div>

        <div className="flex gap-3">
          <Button variant="primary">提交答案</Button>
          <Button variant="ghost">保存草稿</Button>
        </div>
      </div>
    </Card>
  );
}
