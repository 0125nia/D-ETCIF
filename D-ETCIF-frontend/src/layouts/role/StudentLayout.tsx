import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div>
      <h1>学生布局</h1>
      <Outlet />
    </div>
  );
}
