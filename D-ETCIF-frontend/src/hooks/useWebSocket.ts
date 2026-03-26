// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { useFeedbackStore } from '@/store/feedback.store';

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuthStore();
  const { setSelectedFeedback } = useFeedbackStore();

  useEffect(() => {
    
    if (!user?.id || user.id === "" || ws.current) return;

    
    const token = localStorage.getItem("token");

    // 2. 转换 BaseURL (http://localhost:4000 -> ws://localhost:4000)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const wsUrl = `${baseUrl.replace(/^http/, 'ws')}/ws/${user.id}${token ? `?token=${token}` : ''}`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log(`[D-ETCIF] 实时评价通道已开启: Student ${user.name}`);
    };

    socket.onmessage = (event) => {
      try {
        const res = JSON.parse(event.data);
        
        // 处理一级反馈 匹配后端推送到 REALTIME_FEEDBACK
        if (res.type === 'REALTIME_FEEDBACK') {
          res.data.forEach((alert: any) => {
            // A. 调用你现有的 toast 逻辑展示 UI
            const severity = alert.Severity.toLowerCase() as "success" | "error" | "warning";
            toast[severity](`${alert.Name}: ${alert.Message}`);

            setSelectedFeedback(`${alert.Name}\n${alert.Message}`);
          });
        }


        // 处理二级反馈 (注入到侧边栏 Feedback)
        if (res.type === 'STRATEGY_FEEDBACK') {
            const { title, content, code_snippet,knowledge_link } = res.data;
            
            // 1. 弹出轻量提醒
            toast.warning("收到一条新的思路引导，请查看右侧面板");

            // 2. 适配你的 FeedbackStore：更新当前选中的反馈内容
            const { setSelectedFeedback } = useFeedbackStore.getState();
            const displayContent = `
                ### ${title}
                ${content}

                \`\`\`python
                ${code_snippet}
                \`\`\`
                > **知识点关联：** [点击查看详情](${knowledge_link})
                    `;
            setSelectedFeedback(displayContent);
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
  }, [user.id]); // 当用户 ID 变化时重新挂载（如登入/登出）

  return ws.current;
};