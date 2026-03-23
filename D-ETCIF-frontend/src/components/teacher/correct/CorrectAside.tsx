import { List } from "@/components/common";

const data = [
  {
    id: 1,
    name: "实验1",
    children: [
      { id: 101, name: "张三" },
      { id: 102, name: "李四" },
    ],
  },
  { id: 2, name: "实验2", children: [{ id: 201, name: "王五" }] },
];

export default function CorrectAside() {
  return (
    <>
      <h2 className="font-semibold mb-3">实验列表</h2>
      <List data={data} renderItem={(item) => <div>{item.name}</div>} />
    </>
  );
}
