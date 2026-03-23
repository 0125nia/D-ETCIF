# python_service

本目录是 D-ETCIF 的 Python 侧辅助服务/实验代码集合

> 说明：此目录更偏“分析/实验”性质，部分脚本末尾包含示例调用，直接运行会读写本地数据目录。

## 目录结构

```
python_service
├── 00-monitor.py
├── analysis
│   ├── data
│   │   ├── annotated
│   │   ├── processed
│   │   ├── raw
│   │   └── res
│   ├── extraction
│   │   ├── data_source.py
│   │   ├── extractor.py
│   │   ├── pptx_processor.py
│   │   └── text_processor.py
│   ├── main.py
│   ├── neo4j
│   │   ├── graph_builder.py
│   │   └── query.py
│   └── tests
├── ipynb
│   └── test.ipynb
├── README.md
└── scripts
    ├── ipynb_monitor.sh
    └── ipynb.sh
```

## 环境要求

- miniforge 或 Miniconda ，Python 3.10+
- pip

## 启动服务（FastAPI）

服务入口在 [analysis/app/main.py](analysis/app/main.py)

```bash
cd python_service
uvicorn main:app --app-dir analysis/app --reload --port 8000
```

启动后访问：

- `GET http://127.0.0.1:8000/healthz` → `{"ok": true}`
- Swagger UI：`http://127.0.0.1:8000/docs`
