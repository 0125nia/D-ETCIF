from pathlib import Path


# python_service 根目录
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# 统一数据目录
DATA_DIR = PROJECT_ROOT / "data"

# 配置文件
ENV_FILE = PROJECT_ROOT / ".env"

# 数据分包
INPUT_RAW_DIR = DATA_DIR / "inputs" / "raw"
INPUT_PROCESSED_DIR = DATA_DIR / "inputs" / "processed"
INPUT_ANNOTATED_DIR = DATA_DIR / "inputs" / "annotated"
INPUT_RES_DIR = DATA_DIR / "inputs" / "res"

GRAPH_BOOTSTRAP_DIR = DATA_DIR / "graph" / "bootstrap"
GRAPH_EXPORT_DIR = DATA_DIR / "graph" / "exports"
GRAPH_CLEANED_DIR = DATA_DIR / "graph" / "cleaned"

NER_FINAL_MODEL_DIR = DATA_DIR / "models" / "ner" / "final"
NER_CHECKPOINT_DIR = DATA_DIR / "models" / "ner" / "checkpoints"
NODE2VEC_MODEL_DIR = DATA_DIR / "models" / "node2vec"

# 常用文件路径
EXPERIMENT_GRAPH_BOOTSTRAP_FILE = GRAPH_BOOTSTRAP_DIR / "experiment_data.json"
GRAPH_EXPORTED_FILE = GRAPH_EXPORT_DIR / "exported_domain_kg.json"
GRAPH_CLEANED_FILE = GRAPH_CLEANED_DIR / "cleaned_domain_kg.json"
NODE2VEC_MODEL_PATH = NODE2VEC_MODEL_DIR / "exp_node2vec.model"


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
