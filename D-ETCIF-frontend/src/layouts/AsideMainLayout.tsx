// Package layouts
// D-ETCIF-frontend/src/layouts/AsideMainLayout.tsx
interface Props {
  aside: React.ReactNode; // 左侧内容
  main: React.ReactNode; // 右侧内容
}

export default function AsideMainLayout({ aside, main }: Props) {
  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded shadow overflow-hidden">
      {/* 左侧 */}
      <aside className="w-[260px] border-r bg-gray-50 p-4">{aside}</aside>

      {/* 右侧 */}
      <main className="flex-1 p-6">{main}</main>
    </div>
  );
}
