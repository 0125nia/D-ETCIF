import List from "@/components/common/List";

const data = [{ id: 1, name: "实验1", children: [{ id: 101, name: "求助1" }] }];

export default function HelpAside() {
  return (
    <>
      <h2 className="font-semibold mb-3">求助列表</h2>
      <List data={data} renderItem={(item) => <div>{item.name}</div>} />
    </>
  );
}
