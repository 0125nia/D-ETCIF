export default function LowConfidence() {
  return (
    <div className="bg-white/80 p-4 rounded-lg border border-gray-200 flex flex-col">
      <h3 className="text-lg font-semibold text-red-600 mb-3">
        低置信度学生 Top
      </h3>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          <li className="p-2 border-b flex justify-between">
            <span>张三 (高数)</span>
            <span className="text-red-500 text-sm">置信度: 0.32</span>
          </li>
          <li className="p-2 border-b flex justify-between">
            <span>李四 (英语)</span>
            <span className="text-red-500 text-sm">置信度: 0.28</span>
          </li>
          {/* 更多数据... */}
        </ul>
      </div>
    </div>
  );
}
