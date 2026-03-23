export default function PostStagePage() {
  return (
    <div className="flex items-center justify-center h-[64vh]">
      <p className="text-xl text-gray-500">实验后页面正在开发中...</p>
    </div>
  );
}
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";

// import EmptyState from "@/components/common/EmptyState";
// import LoadingState from "@/components/common/LoadingState";
// import Card from "@/components/common/Card";

// import {
//   getPostStageApi,
//   submitPostStageReportApi,
// } from "@/services/studentStage";
// import type {
//   GetPostStageRes,
//   SubmitPostStageReportReq,
// } from "@/types/res/studentStage";

// import PostReportForm from "@/components/student/stage/PostReportForm";

// export default function PostStagePage() {
//   const params = useParams();
//   const labId = useMemo(() => Number(params.labId), [params.labId]);

//   const [data, setData] = useState<GetPostStageRes | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const [submitting, setSubmitting] = useState<boolean>(false);

//   const fetchData = () => {
//     if (!Number.isFinite(labId)) return;

//     setLoading(true);
//     setError(null);

//     getPostStageApi(labId)
//       .then((res) => setData(res))
//       .catch(() => setError("实验后页面加载失败"))
//       .finally(() => setLoading(false));
//   };

//   // useEffect(() => {
//   //   fetchData();
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [labId]);

//   const handleSubmit = (payload: Omit<SubmitPostStageReportReq, "labId">) => {
//     if (!Number.isFinite(labId)) return;

//     setSubmitting(true);
//     submitPostStageReportApi({ labId, ...payload })
//       .then(() => fetchData())
//       .finally(() => setSubmitting(false));
//   };

//   if (!Number.isFinite(labId)) {
//     return <EmptyState title="无效的实验 ID" />;
//   }

//   if (loading) {
//     return <LoadingState label="正在加载实验后页面..." />;
//   }

//   if (error) {
//     return <EmptyState title={error} description="请稍后重试" />;
//   }

//   if (!data) {
//     return <EmptyState title="暂无数据" />;
//   }

//   return (
//     <div className="grid grid-cols-12 gap-4 min-h-[64vh]">
//       <div className="col-span-8">
//         <PostReportForm
//           template={data.reportTemplate}
//           onSubmit={handleSubmit}
//           submitting={submitting}
//         />
//       </div>

//       <div className="col-span-4 space-y-4">
//         <Card>
//           <div className="text-slate-900 font-medium">最近一次提交</div>
//           {data.latestSubmission ? (
//             <div className="mt-3 text-sm text-slate-700 space-y-1">
//               <div>提交时间：{data.latestSubmission.submittedAt}</div>
//               <div>
//                 评分：
//                 {typeof data.latestSubmission.score === "number"
//                   ? data.latestSubmission.score
//                   : "-"}
//               </div>
//               <div>
//                 评语：
//                 {data.latestSubmission.comment
//                   ? data.latestSubmission.comment
//                   : "-"}
//               </div>
//             </div>
//           ) : (
//             <div className="mt-3 text-sm text-slate-500">暂无提交记录</div>
//           )}
//         </Card>

//         <Card>
//           <div className="text-slate-900 font-medium">提交说明</div>
//           <div className="mt-2 text-sm text-slate-600">
//             该页面按后端返回的 reportTemplate
//             渲染，后续你只需要在后端配置模板与校验逻辑。
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
