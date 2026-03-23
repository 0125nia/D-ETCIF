interface StatItemProps {
  label: string; // 标签文字
  value: string | number; // 数值
  className?: string; // 自定义样式
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-lg font-semibold text-gray-900 mt-1">{value}</span>
    </div>
  );
};

export default StatItem;
