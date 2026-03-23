export default function LoadingState({ label }: { label?: string }) {
  return (
    <div className="w-full py-10 flex items-center justify-center text-sm text-slate-500">
      {label || "加载中..."}
    </div>
  );
}
