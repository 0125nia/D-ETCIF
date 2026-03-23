interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // 自定义外层样式
  headerClassName?: string; // 自定义标题样式
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerClassName = "",
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${className}`}>
      {/* 标题区域 */}
      <h2
        className={`text-xl font-bold mb-4 text-gray-800 border-b pb-2 ${headerClassName}`}
      >
        {title}
      </h2>

      {/* 内容区域 */}
      <div className="card-content flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Card;
