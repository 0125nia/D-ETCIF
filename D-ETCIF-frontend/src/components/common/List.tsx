// Package common
// D-ETCIF-frontend/src/components/common/List.tsx
import React, { useState } from "react";

// 树形结构节点接口（支持 children 递归）
export interface TreeItem<T = unknown> {
  id: string | number;
  children?: TreeItem<T>[];
}

const getAllKeys = <T extends TreeItem>(items: T[]): Array<string | number> =>
  items.reduce<Array<string | number>>((keys, item) => {
    keys.push(item.id);
    if (item.children?.length) {
      keys.push(...getAllKeys(item.children as T[]));
    }
    return keys;
  }, []);

interface ListProps<T extends TreeItem> {
  // 树形数据（必须包含 id + 可选 children）
  data: T[];
  // 渲染每一项内容
  renderItem: (item: T) => React.ReactNode;
  // 自定义类名
  className?: string;
  // 空数据提示
  emptyText?: string;
  // 是否默认展开所有
  defaultExpandAll?: boolean;
}

const List = <T extends TreeItem>({
  data,
  renderItem,
  className = "",
  emptyText = "暂无数据",
  defaultExpandAll = false,
}: ListProps<T>) => {
  // 存储展开的节点 ID
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>(
    () => (defaultExpandAll ? getAllKeys(data) : []),
  );

  // 切换展开/折叠
  const toggleExpand = (id: string | number) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id],
    );
  };

  // 递归渲染节点
  const renderTreeItems = (items: T[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedKeys.includes(item.id);

      return (
        <li key={item.id} className="list-item">
          {/* 项内容 + 展开按钮 */}
          <div className="flex items-center">
            {/* 文件夹展开箭头 */}
            {hasChildren && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="mr-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
              >
                {/* 箭头图标 */}
                <span
                  className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`}
                >
                  ▶
                </span>
              </button>
            )}

            {/* 渲染自定义内容 */}
            <div className="flex-1">{renderItem(item)}</div>
          </div>

          {/* 子节点（展开时显示） */}
          {hasChildren && isExpanded && (
            <ul className="ml-6 mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
              {renderTreeItems(item.children as T[])}
            </ul>
          )}
        </li>
      );
    });
  };

  // 空状态
  if (!data || data.length === 0) {
    return (
      <div className="py-4 text-center text-gray-400 text-sm">{emptyText}</div>
    );
  }

  return <ul className={`space-y-3 ${className}`}>{renderTreeItems(data)}</ul>;
};

export default List;
