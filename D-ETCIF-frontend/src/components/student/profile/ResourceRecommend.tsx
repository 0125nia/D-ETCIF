import List from "@/components/common/List";
import Card from "@/components/common/Card";

interface Resource {
  id: number;
  name: string;
}

const ResourceRecommend = () => {
  const resources: Resource[] = [
    { id: 1, name: "React 高级技巧教程" },
    { id: 2, name: "TypeScript 实战项目" },
    { id: 3, name: "前端性能优化指南" },
    { id: 4, name: "算法刷题模板" },
    { id: 5, name: "算法刷题模板" },
    { id: 6, name: "算法刷题模板" },
    { id: 7, name: "算法刷题模板" },
  ];

  return (
    <Card title="推荐资源" className="flex-1">
      {/* 使用通用列表 */}
      <List
        data={resources}
        renderItem={(item) => (
          <div className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
            {item.name}
          </div>
        )}
      />
    </Card>
  );
};

export default ResourceRecommend;
