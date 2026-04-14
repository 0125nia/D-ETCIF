// Package common

import { Dashboard } from "@/pages/teacher";

// D-ETCIF-frontend/src/pages/common/Test.tsx
export default function Test() {
  // const data = [
  //   { id: 1, name: "第一项" },
  //   { id: 2, name: "第二项" },
  // ];
  // interface Resource {
  //   id: number;
  //   name: string;
  //   children?: Resource[]; // 子资源
  // }
  // const resources: Resource[] = [
  //   {
  //     id: 1,
  //     name: "前端学习",
  //     children: [
  //       { id: 11, name: "React 高级技巧教程" },
  //       { id: 12, name: "TypeScript 实战项目" },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: "通用技能",
  //     children: [
  //       { id: 21, name: "前端性能优化指南" },
  //       { id: 22, name: "算法刷题模板" },
  //       {
  //         id: 23,
  //         name: "计算机基础",
  //         children: [
  //           { id: 231, name: "操作系统" },
  //           { id: 232, name: "计算机网络" },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  return (
    <div>
      <Dashboard />
    </div>
    // <CodeEditor />
    // <DoingStageLeft />
    // <PageContainer title="教学看板">
    //   <List data={data} renderItem={(item) => <div>{item.name}</div>} />
    //   -------------------------------------
    //   <List data={[]} emptyText="暂无推荐资源" renderItem={() => <div></div>} />
    //   -------------------------------------
    //   <List
    //     data={resources}
    //     renderItem={(item) => (
    //       <div className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
    //         {item.name}
    //       </div>
    //     )}
    //     defaultExpandAll={false} // 默认不展开
    //   />
    // </PageContainer>
  );
}
