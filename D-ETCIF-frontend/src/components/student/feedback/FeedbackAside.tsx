import { List } from "@/components/common";

const data = [
  { id: 1, name: "实验一" },
  { id: 2, name: "实验二" },
  { id: 3, name: "实验三" },
];

export default function FeedbackAside() {
  return (
    <>
      <h2 className="font-semibold mb-3">实验列表</h2>
      <List data={data} renderItem={(item) => <div>{item.name}</div>} />
    </>
  );
}
