import { List } from "@/components/common";
export default function PreStageAside() {
  const data = [
    { id: 1, name: "实验一" },
    { id: 2, name: "实验二" },
    { id: 3, name: "实验三" },
  ];
  return (
    <>
      <List data={data} renderItem={(item) => <div>{item.name}</div>} />
    </>
  );
}
