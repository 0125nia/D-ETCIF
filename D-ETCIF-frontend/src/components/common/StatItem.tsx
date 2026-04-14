// Package common
// D-ETCIF-frontend/src/components/common/StatItem.tsx
interface StatItemProps {
  label: string; // 标签文字
  value: string | number; // 数值
  unit?: string; // 单位
  valueColor?: string; // 数值颜色类名
  className?: string; // 自定义样式
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  unit,
  valueColor = "text-gray-900",
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <div className="mt-1">
        <span className={`text-lg font-semibold ${valueColor}`}>{value}</span>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default StatItem;
