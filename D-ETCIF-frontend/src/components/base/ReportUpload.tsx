// Package base
// D-ETCIF-frontend/src/components/base/ReportUpload.tsx
import { useState } from "react";
import { Card, Button } from "@/components/common";
import { toast } from "@/store"; // 使用项目统一的 toast
import { uploadExperimentReport } from "@/services/experiment";
import { trackPostEvent } from "@/services/tracker";
import { useParams } from "react-router-dom";

export default function ReportUpload() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "success">(
    "idle",
  );

  // 点击虚线框 → 打开文件选择
  const triggerFileSelect = () => {
    document.getElementById("report-upload")?.click();
  };

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress("idle"); // 重新选择文件时重置状态
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !experimentId) {
      toast.error("请先选择文件");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reportFile", file);
      formData.append("experimentId", experimentId);

      await uploadExperimentReport(formData);

      trackPostEvent({
        experiment_id: experimentId,
        action_type: "post_report_submit",
        score: 0,
        content: `实验报告上传：${file.name}`,
      }).catch(console.error);

      toast.success("报告上传成功！");
      setUploadProgress("success");
      setFile(null);
    } catch (err) {
      toast.error("上传失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="报告上传">
      <div className="space-y-4">
        <div
          onClick={triggerFileSelect}
          className={`border border-dashed rounded p-6 text-center text-sm cursor-pointer transition-colors
            ${file ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}
          `}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-blue-700 font-medium truncate w-full px-4">
                {file.name}
              </p>
              <p className="text-xs text-blue-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="text-xs text-red-500 hover:underline mt-1"
              >
                删除并重新选择
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              <p className="font-medium text-gray-600">点击此处选择文件</p>
              <p className="text-xs mt-1">支持 PDF, Word, Excel 格式</p>
            </div>
          )}
        </div>

        <input
          type="file"
          id="report-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />

        <Button
          variant="primary"
          className="w-full"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "正在上传..." : "确认上传报告"}
        </Button>

        {uploadProgress === "success" && (
          <p className="text-center text-xs text-green-600 animate-pulse">
            ✓ 您的报告已成功存档
          </p>
        )}
      </div>
    </Card>
  );
}
