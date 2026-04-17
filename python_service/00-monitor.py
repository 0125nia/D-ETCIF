import os
import urllib.parse
import requests
import threading
from IPython import get_ipython
query = os.environ.get('QUERY_STRING', '')
params = urllib.parse.parse_qs(query)
student_id = params.get('studentId', [''])[0]
experiment_id = params.get('experimentId', [''])[0]
def perform_post(data):
    try:
        requests.post(
            "http://localhost:4000/api/v1/monitor/collect",
            json=data,
            timeout=1.5
        )
    except:
        pass 
def send_to_backend(result):
    data = {
        "studentId": student_id,
        "experimentId": experiment_id,
        "cell_content": str(result.info.raw_cell),
        "execution_count": result.execution_count,
        "success": result.error_in_exec is None,
        "error": str(result.error_in_exec) if result.error_in_exec else ""
    }
    # 异步上报
    threading.Thread(target=perform_post, args=(data,), daemon=True).start()
# 注册钩子
ip = get_ipython()
if ip:
    try:
        ip.events.unregister('post_run_cell', send_to_backend)
    except:
        pass
    ip.events.register('post_run_cell', send_to_backend)