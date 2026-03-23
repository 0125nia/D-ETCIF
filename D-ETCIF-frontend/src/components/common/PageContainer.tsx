export default function PageContainer({
  title = "",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-slate-900">{title}</div>
      </div>

      {children}
    </div>
  );
}
