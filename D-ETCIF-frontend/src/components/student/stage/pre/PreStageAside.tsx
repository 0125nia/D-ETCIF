import { List } from "@/components/common";
import type { ResourceItem } from "@/types/domain/resource";



export default function PreStageAside({
  selectedResource,
  onSelect,
}: {
  selectedResource: ResourceItem | null;
  onSelect: (item: ResourceItem) => void;
})  {
  const resources : ResourceItem[]= [
    {
      id: 1,
      name: "实验指导资料",
      children: [
        {
          id: 11,
          name: "实验 1 课件",
          url: "/resource/第1章 数据可视化与matplotlib.pdf", // 本地PDF
          type: "pdf",
        },
        {
          id: 12,
          name: "matplotlib 视频教程",
          url: "/resource/matplotlib.mp4", // 本地视频
          type: "video",
        },
      ],

    },
    {
      id: 2,
      name: "实验资源",
      children: [
        {
          id: 21,
          name: "实验 1 课件",
          url: "/source/files/experiment-guide.pdf", // 本地PDF
          type: "pdf",
        },
        {
          id: 22,
          name: "实验教程资源",
          url: "/source/files/experiment-tutorial.mp4", // 本地视频
          type: "video",
        },
      ],
    },
    {
      id: 3,
      name: "参考代码",
      children: [
        {
          id: 31,
          name: "实验 1 课件",
          url: "/Volumn/A/source/files/experiment-guide.pdf", // 本地PDF
          type: "pdf",
        },
        {
          id: 32,
          name: "实验教程资源",
          url: "/source/files/experiment-tutorial.mp4", // 本地视频
          type: "video",
        },
      ],
    },
    {
      id: 4,
      name: "帮助文档",
      children: [
        {
          id: 41,
          name: "实验 1 课件",
          url: "/source/files/experiment-guide.pdf", // 本地PDF
          type: "pdf",
        },
        {
          id: 42,
          name: "实验教程资源",
          url: "/source/files/experiment-tutorial.mp4", // 本地视频
          type: "video",
        },
      ],
    },
  ];

  return (
    <List
      data={resources}
      renderItem={(item) => (
        <div
          onClick={() => onSelect(item)}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            borderRadius: "4px",
            backgroundColor: selectedResource?.id === item.id ? "#e6f7ff" : "#fff",
          }}
        >
          {item.name}
        </div>
      )}  
    />
  )
}
