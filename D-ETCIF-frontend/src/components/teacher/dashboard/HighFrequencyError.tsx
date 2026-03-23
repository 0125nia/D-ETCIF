export default function HighFrequencyError() {
  return (
    <div className="bg-white/80 p-4 rounded-lg border border-gray-200 flex flex-col">
      <h3 className="text-lg font-semibold text-orange-600 mb-3">
        高频错误点 Top
      </h3>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          <li className="p-2 border-b flex justify-between">
            <span>第3章 - 递归算法</span>
            <span className="text-orange-500 text-sm">错误率: 67%</span>
          </li>
          <li className="p-2 border-b flex justify-between">
            <span>第5章 - 函数定义</span>
            <span className="text-orange-500 text-sm">错误率: 52%</span>
          </li>
          {/* 更多数据... */}
        </ul>
      </div>
    </div>
  );
}
