// Package auth
// D-ETCIF-frontend/src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { loginApi, convertRole } from "@/services/auth";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import PageContainer from "@/components/common/PageContainer";
import { toast } from "@/store";

export default function LoginPage() {
  const nav = useNavigate();
  const { loginSuccess } = useAuthStore();
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

      loginSuccess({
        token: res.token,
        role: convertRole(res.user.role),
        user: {
          id: res.user.id,
          user_number: res.user.user_number,
          name: res.user.name,
          role: convertRole(res.user.role),
        },
      });

      toast.success("登录成功");
      nav(role === "student" ? "/student/lab" : "/teacher/dashboard");
    } catch (err: any) {
      console.log("后端登录失败，启用 mock");
      // mock 登录
      loginSuccess({
        token: "mock-student-token",
        role: "student",
        user: {
          id: 999,
          user_number: "2211111144",
          name: "test",
          role: "student",
        },
      });

      toast.success("登录成功（Mock）");
      nav("/student/lab");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-6 left-8 z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-wider">
          D-ETCIF
        </h1>
      </div>
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
                onChange={(e) =>
                  setRole(e.target.value as "student" | "teacher")
                }
              >
                <option value="student">学生</option>
                <option value="teacher">教师</option>
              </select>

              <Button
                className="w-full"
                loading={loading}
                onClick={handleLogin}
              >
                登录
              </Button>
            </div>
          </PageContainer>
        </Card>
      </div>
    </>
  );
}
