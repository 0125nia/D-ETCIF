import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/services/auth";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import PageContainer from "@/components/common/PageContainer";
import { toast } from "@/store";

export default function LoginPage() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("请输入账号和密码");
      return;
    }
    try {
      setLoading(true);

      const res = await loginApi(username, password, role);

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", role);

      if (role === "student") {
        toast.success("登录成功");
        nav("/student/lab");
      } else {
        toast.success("登录成功");
        nav("/teacher/dashboard");
      }
    } catch (err: any) {
      console.error("登录失败", err);
      toast.error(err?.response?.data?.error || "登录失败：账号或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Card>
        <PageContainer title="系统登录">
          <div className="space-y-3 w-80">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="账号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "teacher")}
            >
              <option value="student">学生</option>
              <option value="teacher">教师</option>
            </select>

            <Button className="w-full" loading={loading} onClick={handleLogin}>
              登录
            </Button>
          </div>
        </PageContainer>
      </Card>
    </div>
  );
}
