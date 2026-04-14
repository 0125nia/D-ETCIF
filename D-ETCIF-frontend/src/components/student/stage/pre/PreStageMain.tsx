// Package pre
// D-ETCIF-frontend/src/components/student/stage/pre/PreStageMain.tsx
import type { ResourceItem } from "@/types/experimentData";

export default function PreStageMain({
  resource,
}: {
  resource: ResourceItem | null;
}) {
  if (!resource) {
    return (
      <div style={{ padding: "30px" }}>
        <h3>请在左侧选择一个资源文件</h3>
      </div>
    );
  }

  // 根据文件类型渲染
  const renderResource = () => {
    switch (resource.type) {
      case "pdf":
        return (
          <iframe
            src={resource.url}
            style={{ width: "100%", height: "700px", border: "none" }}
            title="PDF预览"
          />
        );

      case "image":
        return (
          <img
            src={resource.url}
            alt={resource.name}
            style={{ maxWidth: "100%", maxHeight: "700px" }}
          />
        );

      case "text":
        return (
          <iframe
            src={resource.url}
            style={{ width: "100%", height: "700px", border: "none" }}
          />
        );

      case "html":
        return (
          <iframe
            src={resource.url}
            style={{ width: "100%", height: "700px", border: "none" }}
          />
        );
      case "video":
        return (
          <video
            src={resource.url}
            controls
            style={{
              width: "100%",
              maxHeight: "700px",
              borderRadius: "8px",
            }}
            autoPlay={false}
          >
            您的浏览器不支持视频播放
          </video>
        );

      default:
        return <p>不支持的文件类型</p>;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>当前资源：{resource.name}</h3>
      <div style={{ marginTop: "16px" }}>{renderResource()}</div>
    </div>
  );
}
