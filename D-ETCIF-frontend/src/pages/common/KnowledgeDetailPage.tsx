// Package common
// D-ETCIF-frontend/src/pages/common/KnowledgeDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import KnowledgeCard from "@/components/common/KnowledgeCard";
import { Navigate } from "react-router-dom";

// 知识点类型定义
export interface KnowledgeItem {
  name: string; // 路由唯一名称
  title: string; // 题目
  content: string; // 详情
}

const FRONTEND_KNOWLEDGE_LIST: KnowledgeItem[] = [
  {
    name: "data-visualization",
    title: "数据可视化",
    content:
      "数据可视化的定义：借助图形化手段将数据以图形表示，挖掘未知信息、传递数据关系与规律的处理过程，是从数据空间到图形空间的映射",
  },
  {
    name: "common-visualization-ways",
    title: "常见数据可视化方式",
    content:
      "常见数据可视化方式：折线图、柱形图、条形图、堆积图、直方图、箱形图、饼图、圆环图、散点图、气泡图、误差棒图、雷达图、统计地图、3D 图表等，掌握柱形图与直方图的核心区别",
  },

  {
    name: "data-relationships",
    title: "数据的四种关系及图表选择",
    content:
      "数据的四种关系及图表选择：比较、分布、构成、联系关系，需根据数据关系选择对应可视化图表",
  },

  {
    name: "python-visualization-libraries",
    title: "Python 常见数据可视化库",
    content:
      "Python 常见数据可视化库：matplotlib（鼻祖，支持 2D/3D 绘图）、seaborn（matplotlib 高级封装，交互式）、ggplot（叠加图层，易绘制）、bokeh（交互式，适配 Web）、pygal（生成 SVG 可缩放图表）、pyecharts（生成 Echarts 交互图表）",
  },
  {
    name: "matplotlib-apis",
    title: "matplotlib 的三种 API",
    content:
      "matplotlib 的三种 API：pyplot API（快速绘图，类 MATLAB）、object-oriented API（面向对象，自定义图表）、pylab API（官方弃用，整合 pyplot 与 numpy）",
  },
];

// 模拟请求（优先前端配置，以后可换成真实接口）
const fetchKnowledgeByKey = async (
  name: string,
): Promise<KnowledgeItem | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200)); // 模拟加载
  // 先从前端内置配置里找
  const found = FRONTEND_KNOWLEDGE_LIST.find((item) => item.name === name);
  if (found) return found;

  // 这里以后可以加后端请求逻辑
  // const res = await fetch(`/api/knowledge/${name}`)
  // return await res.json()

  return null;
};

const KnowledgeDetailPage = () => {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;

    const loadData = async () => {
      setLoading(true);
      const result = await fetchKnowledgeByKey(name);
      setData(result);
      setLoading(false);
    };

    loadData();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }

  if (!data) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <KnowledgeCard data={data} />
    </div>
  );
};

export default KnowledgeDetailPage;
