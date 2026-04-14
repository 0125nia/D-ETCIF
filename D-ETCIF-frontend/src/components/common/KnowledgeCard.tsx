// Package common
// D-ETCIF-frontend/src/components/common/KnowledgeCard.tsx
import React from "react";

export interface KnowledgeItem {
  name: string;
  title: string;
  content: string;
}

interface KnowledgeCardProps {
  data: KnowledgeItem;
  className?: string;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  data,
  className = "",
}) => {
  const { title, content } = data;

  return (
    <div
      className={`
        w-full 
        max-w-3xl       /* 👈 变大：从 2xl → 3xl */
        bg-white rounded-xl shadow-md 
        p-8 md:p-10     /* 👈 内边距变大 */
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
        border border-gray-100 ${className}
      `}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        {title}
      </h3>
      <div className="w-20 h-1 bg-blue-500 rounded-full mb-5"></div>
      <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  );
};

export default KnowledgeCard;
