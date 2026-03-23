import requests
from IPython import get_ipython

def send_to_backend(result):
    # 准备要采集的数据
    data = {
        "cell_content": result.info.raw_cell,  # 执行的命令
        "execution_count": result.execution_count,  # 执行次数
        "success": result.error_in_exec is None,  # 是否执行成功
        "error": str(result.error_in_exec) if result.error_in_exec else ""
    }
    
    # 发送到你的 Go 后端 API
    try:
        requests.post("http://localhost:4000/api/v1/monitor/collect", json=data, timeout=1)
    except Exception as e:
        print(f"数据采集发送失败: {e}")

# 注册钩子
ip = get_ipython()
if ip:
    ip.events.register('post_run_cell', send_to_backend)
    print("监控已就绪：正在伴随采集执行数据...")