// Package hooks
// D-ETCIF-frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { useFeedbackStore } from "@/store/feedback.store";
import type { Feedback } from "@/types/feedback";
import { API_BASE_URL } from "@/services/api";

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const user = useAuthStore((s) => s.user);
  const { setSelectedFeedback } = useFeedbackStore();

  useEffect(() => {
    const userId = user?.id;
    const userName = user?.name;
    if (userId == null || ws.current) return;

    const token = useAuthStore.getState().token;

    const baseUrl = API_BASE_URL;
    const wsUrl = `${baseUrl.replace(/^http/, "ws")}/ws/${userId}${token ? `?token=${token}` : ""}`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log(
        `[D-ETCIF] 实时评价通道已开启: Student ${userName ?? "unknown"}`,
      );
    };

    socket.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);

        // 处理一级反馈 匹配后端推送到 REALTIME_FEEDBACK
        if (res.type === "REALTIME_FEEDBACK") {
          res.data.forEach((alert: any) => {
            // A. 调用你现有的 toast 逻辑展示 UI
            const severity = alert.Severity.toLowerCase() as
              | "success"
              | "error"
              | "warning";
            toast[severity](`${alert.Name}: ${alert.Message}`);

            const feedback: Feedback = {
              id: `rt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
              type: "REALTIME",
              title: alert.Name || "实时反馈",
              content: alert.Message
                ? `${alert.Name}: ${alert.Message}`
                : String(alert.Name || ""),
              severity,
              createdAt: Date.now(),
            };

            setSelectedFeedback(feedback);
          });
        }

        // 处理二级反馈 (注入到侧边栏 Feedback)
        if (res.type === "STRATEGY_FEEDBACK") {
          const { title, content, code_snippet, knowledge_link } = res.data;

          // 1. 弹出轻量提醒
          toast.warning("收到一条新的思路引导，请查看右侧面板");

          // 2. 适配你的 FeedbackStore：更新当前选中的反馈内容
          const feedback: Feedback = {
            id: `st_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            type: "STRATEGY",
            title: title || "思路引导",
            content: `
### ${title}
${content}

\`\`\`python
${code_snippet}
\`\`\`

> **知识点关联：** [点击查看详情](${knowledge_link})
`,
            severity: "warning",
            createdAt: Date.now(),
            codeSnippet: code_snippet,
            knowledgeLink: knowledge_link,
          };

          setSelectedFeedback(feedback);
        }
      } catch (err) {
        console.error("WS Message Parse Error", err);
      }
    };

    socket.onclose = () => {
      console.warn("[D-ETCIF] 实时评价通道已断开");
      ws.current = null;
    };

    socket.onerror = (err) => {
      console.error("[D-ETCIF] WS Error:", err);
    };

    // 组件卸载或用户登出时关闭
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user?.id]); // 当用户 ID 变化时重新挂载（如登入/登出）

  return ws.current;
};
