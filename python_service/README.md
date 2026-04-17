# python_service

本目录是 D-ETCIF 的算法层服务。

重构后遵循两条规则：

1. 所有代码都在 `app/`。
2. 所有非代码数据都在 `data/`，并按输入/图谱/模型分包。

## 目录结构

```
python_service
├── app
│   ├── api               # FastAPI 入口
│   ├── core              # 路径与通用配置
│   ├── extraction        # 文本/课件抽取
│   ├── model             # 数据集构造与 NER 训练
│   ├── neo4j             # 图谱导出/清洗/回灌
│   ├── node2vec          # 推荐模型
│   ├── monitor           # Jupyter 监控上报
│   ├── scripts           # 启动脚本
│   └── tests             # 测试脚本
├── data
│   ├── inputs            # 原始/处理后/标注数据
│   ├── graph             # 图谱引导/导出/清洗结果
│   ├── models            # NER/Node2Vec 模型和检查点
│   └── notebooks         # notebook 与相关附件
├── .env
├── requirements.txt
├── README.md
```

## 环境要求

- miniforge 或 Miniconda ，Python 3.10+
- pip

## 启动服务（FastAPI）

服务入口在 `app/api/main.py`。

```bash
cd python_service
uvicorn app.api.main:app --reload --port 8000
```

启动后访问：

- `GET http://127.0.0.1:8000/healthz` → `{"ok": true}`
- Swagger UI：`http://127.0.0.1:8000/docs`
