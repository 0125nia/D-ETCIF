import { useState } from "react";
import { Card, Button } from "@/components/common";

export default function ReportUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 点击虚线框 → 打开文件选择
  const triggerFileSelect = () => {
    document.getElementById("report-upload")?.click();
  };

  // 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // 删除文件
  const handleRemoveFile = () => {
    setFile(null);
  };

  // 点击按钮 → 上传后端
  const handleUpload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reportFile", file);

      // 你的后端上传接口
      const res = await fetch("/api/upload/report", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("上传成功！");
        setFile(null);
      } else {
        alert("上传失败");
      }
    } catch (err) {
      console.error(err);
      alert("上传异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="报告上传">
      <div className="space-y-4">
        <div
          onClick={triggerFileSelect}
          className="border border-dashed border-gray-300 rounded p-6 text-center text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-700 font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">
                大小：{(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="text-xs text-red-500 hover:underline"
              >
                删除文件
              </button>
            </div>
          ) : (
            <p>点击此处选择文件</p>
          )}
        </div>

        {/* 隐藏的文件输入框 */}
        <input
          type="file"
          id="report-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />

        {/* ✅ 点击按钮 → 上传后端 */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "上传中..." : "确认上传报告"}
        </Button>
      </div>
    </Card>
  );
}
