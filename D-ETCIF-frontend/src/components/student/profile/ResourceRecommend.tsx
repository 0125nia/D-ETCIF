import {List,Card} from "@/components/common";
import { useProfileStore } from "@/store/profile.store";



const ResourceRecommend = () => {

  const { resourceRecommendations } = useProfileStore();

  return (
    <Card title="推荐资源" className="flex-1">
      {/* 使用通用列表 */}
      <List
        data={resourceRecommendations}
        renderItem={(item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
          >
            {/* 资源标题 */}
            <div className="font-medium text-gray-800 mb-1">{item.name}</div>
            {/* 资源链接
            <div className="text-xs text-blue-500 truncate">{item.link}</div> */}
          </a>
        )}
      />
    </Card>
  );
};

export default ResourceRecommend;
