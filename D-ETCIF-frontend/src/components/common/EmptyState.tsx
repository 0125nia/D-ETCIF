import type React from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="w-full py-10 flex flex-col items-center justify-center text-center">
      <div className="text-slate-900 font-medium">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
