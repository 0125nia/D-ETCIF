// Package correct
// D-ETCIF-frontend/src/components/teacher/correct/CorrectDetail.tsx
import { useEffect, useState } from "react";
import { Card, Button } from "@/components/common";
import { getStudentResultDetail, getReportDownloadUrl } from "@/services";
import type { StudentResultDetail } from "@/types/experimentRes";

interface Props {
  studentId: number;
  experimentId: number;
  onClose: () => void;
}

export default function CorrectDetail({
  studentId,
  experimentId,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<StudentResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // const mockData: StudentResultDetail = {
    //   student_id: studentId,
    //   experiment_id: experimentId,
    //   operation_result: {
    //     id: 1,
    //     user_id: studentId,
    //     experiment_id: experimentId,
    //     operation_score: 88.5,
    //   },
    //   summary: {
    //     id: 1,
    //     user_id: studentId,
    //     experiment_id: experimentId,
    //     learning_content:
    //       "学习了Linux基础命令、文件权限管理、进程查看等内容，掌握了基本的服务器操作。",
    //     problems_solved:
    //       "遇到权限不足问题，通过chmod修改权限后解决；网络不通通过ifconfig排查。",
    //     status: "submitted",
    //   },
    //   report: {
    //     id: 1,
    //     user_id: studentId,
    //     experiment_id: experimentId,
    //     file_name: "实验报告.pdf",
    //     file_path: "/mock/report.pdf",
    //     updated_at: Math.floor(Date.now() / 1000) - 3600,
    //     status: 1,
    //   },
    // };
    // setDetail(mockData);
    setLoading(true);
    getStudentResultDetail(studentId, experimentId)
      .then((res) => {
        setDetail(res);
      })
      .catch((err) => {
        console.error("获取详情失败:", err);
      })
      .finally(() => setLoading(false));
  }, [studentId, experimentId]);

  useEffect(() => {
    if (detail?.report?.status === 2) {
      // 假设后端返回了分数，这里做回填
    }
  }, [detail]);
  if (loading)
    return <div className="p-10 text-center">正在加载学生产出详情...</div>;
  if (!detail)
    return <div className="p-10 text-center text-red-500">获取数据失败</div>;

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      // 模拟调用：await submitAssessment({ studentId, experimentId, score, comment });
      alert("提交批阅成功！");
      onClose(); // 提交后关闭详情
    } catch (e) {
      alert("提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto pb-10">
      {/* 头部：学生信息 */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">
          学生详情 (ID: {studentId})
        </h3>
        <Button variant="ghost" onClick={onClose}>
          关闭
        </Button>
      </div>

      {/* 第一部分：操作分（客观） */}
      <Card title="自动化评分" className="bg-blue-50/50 border-blue-100">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-blue-600">
            {detail.operation_result?.operation_score ?? "45.0"}
          </span>
          <span className="text-gray-500 text-sm">/ 100 分</span>
        </div>
      </Card>

      {/* 第二部分：实验总结（主观文本） */}
      <Card title="实验总结">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">
              1. 本次实验学到了什么
            </h4>
            <div className="p-3 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap min-h-[80px]">
              {detail.summary?.learning_content || "该生暂未填写"}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">
              2. 遇到的问题与解决方法
            </h4>
            <div className="p-3 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap min-h-[80px]">
              {detail.summary?.problems_solved || "该生暂未填写"}
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-xs px-2 py-1 rounded ${detail.summary?.status === "submitted" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
            >
              状态:{" "}
              {detail.summary?.status === "submitted"
                ? "学生已正式提交"
                : "草稿保存中"}
            </span>
          </div>
        </div>
      </Card>

      {/* 第三部分：附件报告（文件） */}
      <Card title="实验报告附件">
        {detail.report ? (
          <div className="flex items-center justify-between p-4 border rounded-lg border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-800">
                  {detail.report.file_name}
                </p>
                <p className="text-xs text-gray-400">
                  上传时间:{" "}
                  {new Date(detail.report.updated_at * 1000).toLocaleString()}
                </p>
              </div>
            </div>
            <a
              href={getReportDownloadUrl(detail.report.file_path)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="primary">下载报告</Button>
            </a>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 border rounded-lg border-dashed">
            该生尚未上传报告文件
          </div>
        )}
      </Card>
      <Card title="批阅与反馈" headerClassName="text-orange-600">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              综合评分 (0-100)
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="请输入分数"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              老师评语
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-24"
              placeholder="请输入针对该同学实验表现的反馈..."
            />
          </div>
          <Button
            variant="primary"
            className="w-full py-3"
            onClick={handleSubmitAssessment}
            loading={submitting}
          >
            确认提交批阅
          </Button>
        </div>
      </Card>
    </div>
  );
}
