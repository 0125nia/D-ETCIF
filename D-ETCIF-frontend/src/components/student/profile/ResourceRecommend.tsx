// Package profile
// D-ETCIF-frontend/src/components/student/profile/ResourceRecommend.tsx
// D-ETCIF-frontend/src/components/student/profile/ResourceRecommend.tsx
import { List, Card } from "@/components/common";
import type { ResourceRecommendation } from "@/types";

interface Props {
  data: ResourceRecommendation[];
  loading: boolean;
}

const ResourceRecommend = ({ data, loading }: Props) => {
  return (
    <Card title="推荐资源" className="flex-1">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <List
          data={data}
          renderItem={(item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all mb-3 last:mb-0"
            >
              <div className="font-medium text-gray-800 mb-1">{item.name}</div>
            </a>
          )}
        />
      )}
      {data.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-400 text-sm">
          完成更多实验即可获得精准推荐
        </div>
      )}
    </Card>
  );
};

export default ResourceRecommend;
