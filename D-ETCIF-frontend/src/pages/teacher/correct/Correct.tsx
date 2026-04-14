// Package correct
// D-ETCIF-frontend/src/pages/teacher/correct/Correct.tsx
import { useState, useEffect } from "react";
import { PageContainer, Card, Button } from "@/components/common";
import { getAllStudentResults, getExperimentList } from "@/services";
import type { StudentExperimentOverview } from "@/types/experimentRes";
import type { ExperimentItem } from "@/types/experiment";
import { CorrectDetail } from "@/components/teacher";

// const mockExpList: ExperimentItem[] = [
//   {
//     id: 1,
//     experiment_id: 1,
//     name: "实验一：系统环境配置",
//     desc: "",
//     difficulty: 1,
//   },
//   {
//     id: 2,
//     experiment_id: 2,
//     name: "实验二：基础操作实践",
//     desc: "",
//     difficulty: 2,
//   },
//   {
//     id: 3,
//     experiment_id: 3,
//     name: "实验三：综合设计",
//     desc: "",
//     difficulty: 3,
//   },
// ];

// const mockStudentResult: StudentExperimentOverview[] = [
//   {
//     user_id: 1001,
//     username: "张三",
//     experiment_id: 1,
//     current_stage: 1,
//     operation_score: 0,
//     summary_status: "empty",
//     has_report: false,
//   },
//   {
//     user_id: 1002,
//     username: "李四",
//     experiment_id: 1,
//     current_stage: 2,
//     operation_score: 66,
//     summary_status: "draft",
//     has_report: true,
//   },
//   {
//     user_id: 1003,
//     username: "王五",
//     experiment_id: 1,
//     current_stage: 3,
//     operation_score: 89.5,
//     summary_status: "submitted",
//     has_report: true,
//   },
//   {
//     user_id: 1004,
//     username: "赵六",
//     experiment_id: 1,
//     current_stage: 3,
//     operation_score: 92,
//     summary_status: "submitted",
//     has_report: true,
//   },
//   {
//     user_id: 1005,
//     username: "钱七",
//     experiment_id: 1,
//     current_stage: 2,
//     operation_score: 75,
//     summary_status: "draft",
//     has_report: false,
//   },
// ];
export default function Correct() {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState<StudentExperimentOverview[]>(
    [],
  );

  const [viewingStudent, setViewingStudent] = useState<number | null>(null);
  useEffect(() => {
    // // 直接用假数据，注释原请求即可
    // setExperiments(mockExpList);
    // setSelectedExpId(mockExpList[0]?.experiment_id ?? null);
    getExperimentList().then((res) => {
      // res 是 AxiosResponse，res.data 才是 ExperimentItem[]
      setExperiments(res.data);
      if (res.data.length > 0) {
        setSelectedExpId(res.data[0].experiment_id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedExpId) {
      // setStudentList(mockStudentResult);
      setLoading(true);
      getAllStudentResults(selectedExpId)
        .then((res) => {
          // 第一个 .data 是 Axios 的，第二个 .data 是你后端定义的 {"data": []}
          setStudentList(res.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedExpId]);

  return (
    <PageContainer title="实验批阅与进度监控">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {experiments.map((exp) => (
          <Button
            key={exp.id}
            variant={selectedExpId === exp.experiment_id ? "primary" : "ghost"}
            onClick={() => setSelectedExpId(exp.experiment_id)}
            className="whitespace-nowrap"
          >
            {exp.name}
          </Button>
        ))}
      </div>

      <Card title="全班进度概览">
        {loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 font-semibold text-gray-600">学生 ID</th>
                  <th className="p-3 font-semibold text-gray-600">学生姓名</th>
                  <th className="p-3 font-semibold text-gray-600">当前阶段</th>
                  <th className="p-3 font-semibold text-gray-600">操作评分</th>
                  <th className="p-3 font-semibold text-gray-600">实验总结</th>
                  <th className="p-3 font-semibold text-gray-600">附件报告</th>
                  <th className="p-3 font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((student) => (
                  <tr
                    key={student.user_id}
                    className="border-b hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-3 text-gray-700">#{student.user_id}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {student.username || "未知姓名"}
                    </td>
                    <td className="p-3">
                      <StageBadge stage={student.current_stage} />
                    </td>
                    <td className="p-3 font-mono font-medium text-blue-600">
                      {student.operation_score.toFixed(1)}
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        type="summary"
                        status={student.summary_status}
                      />
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        type="report"
                        status={student.has_report ? "submitted" : "empty"}
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        className="text-blue-600"
                        onClick={() => setViewingStudent(student.user_id)}
                      >
                        查看详情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {viewingStudent && selectedExpId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full p-6 shadow-2xl animate-in slide-in-from-right">
            <CorrectDetail
              studentId={viewingStudent}
              experimentId={selectedExpId}
              onClose={() => setViewingStudent(null)}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// --- 辅助状态小组件 ---

function StageBadge({ stage }: { stage: number }) {
  const map: Record<number, { text: string; color: string }> = {
    1: { text: "实验前 (PRE)", color: "bg-gray-100 text-gray-600" },
    2: { text: "实验中 (DOING)", color: "bg-blue-100 text-blue-600" },
    3: { text: "实验后 (POST)", color: "bg-green-100 text-green-600" },
  };
  const config = map[stage] || map[1];
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  type: "summary" | "report";
  status: string;
}) {
  const config: Record<string, { text: string; color: string }> = {
    submitted: { text: "已提交", color: "text-green-600" },
    draft: { text: "草稿中", color: "text-orange-500" },
    empty: { text: "未填写", color: "text-gray-400" },
    uploaded: { text: "已上传", color: "text-green-600" },
    not_uploaded: { text: "未上传", color: "text-gray-400" },
  };
  const res = config[status] || config.empty;
  return <span className={`text-sm ${res.color}`}>● {res.text}</span>;
}
