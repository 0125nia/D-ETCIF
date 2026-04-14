// Package common
// D-ETCIF-frontend/src/components/common/TypedTable.tsx
import type React from "react";

export interface TypedColumn<T extends object> {
  key: keyof T;
  title: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export default function TypedTable<T extends object>({
  columns,
  data,
  rowKey,
}: {
  columns: Array<TypedColumn<T>>;
  data: T[];
  rowKey: (row: T) => string | number;
}) {
  return (
    <table className="w-full border border-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((c) => (
            <th
              key={String(c.key)}
              className={`p-2 border-b border-slate-200 text-left font-medium text-slate-600 ${c.className || ""}`}
            >
              {c.title}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr
            key={String(rowKey(row))}
            className="hover:bg-slate-50 transition-colors"
          >
            {columns.map((c) => (
              <td
                key={String(c.key)}
                className={`p-2 border-b border-slate-100 text-slate-800 ${c.className || ""}`}
              >
                {c.render
                  ? c.render(row)
                  : (row[c.key as keyof T] as unknown as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
