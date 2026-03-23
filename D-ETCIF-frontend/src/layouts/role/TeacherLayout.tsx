import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div>
      <h1>教师布局</h1>
      <Outlet />
    </div>
  );
}
