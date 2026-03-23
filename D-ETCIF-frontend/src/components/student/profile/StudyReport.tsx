import Card from "@/components/common/Card";
import StatItem from "@/components/common/StatItem";

interface StatItem {
  label: string;
  value: string | number;
}

const StudyReport = () => {
  // 数据
  const stats: StatItem[] = [
    { label: "执行次数", value: 128 },
    { label: "反馈次数", value: 45 },
    { label: "班级前", value: "15%" },
    { label: "课程成绩", value: "89分" },
    { label: "总结诊断、薄弱点", value: "5项" },
    { label: "花费时间", value: "320h" },
  ];

  return (
    <Card title="学习报告">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <StatItem key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </Card>
  );
};

export default StudyReport;
