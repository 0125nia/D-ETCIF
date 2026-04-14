// Package layouts
// D-ETCIF-frontend/src/layouts/ThreeColumnLayout.tsx
export default function ThreeColumnLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <>
      {/* 
        核心布局：三栏 Flex 布局
        - 左侧：固定宽度
        - 中间：flex-1 自适应 (填充剩余空间)
        - 右侧：固定宽度
      */}
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        {/* 左侧：实验要求 (窄栏) */}
        <div className="w-[280px]">{left}</div>

        {/* 中间：代码区 (主区域) */}
        <div className="flex-1">{center}</div>

        {/* 右侧：操作与日志 (窄栏) */}
        <div className="w-[350px] flex flex-col gap-4">{right}</div>
      </div>
    </>
  );
}
