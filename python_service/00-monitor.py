# monitor.py
import os
import urllib.parse
import requests
from IPython import get_ipython


query = os.environ.get('QUERY_STRING', '')
params = urllib.parse.parse_qs(query)

# 读取前端传过来的用户信息
student_id = params.get('studentId', [''])[0]
experiment_id = params.get('experimentId', [''])[0]

def send_to_backend(result):
    data = {
        "studentId": student_id,           # 用户ID
        "experimentId": experiment_id,     # 实验ID 
        "cell_content": result.info.raw_cell,
        "execution_count": result.execution_count,
        "success": result.error_in_exec is None,
        "error": str(result.error_in_exec) if result.error_in_exec else ""
    }

    try:
        requests.post(
            "http://localhost:4000/api/v1/monitor/collect",
            json=data,
            timeout=1
        )
    except Exception as e:
        print(f"数据发送失败: {e}")

# 注册钩子
ip = get_ipython()
if ip:
    ip.events.register('post_run_cell', send_to_backend)
    print(f"✅ 监控启动成功")
    print(f"👤 学生ID: {student_id}")
    print(f"🧪 实验ID: {experiment_id}")