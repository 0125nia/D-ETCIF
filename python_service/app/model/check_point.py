import json
import os

from app.core.paths import NER_FINAL_MODEL_DIR

model_path = str(NER_FINAL_MODEL_DIR)
config_path = os.path.join(model_path, "config.json")

if os.path.exists(config_path):
    with open(config_path, "r") as f:
        config = json.load(f)
        print("--- 模型配置检查 ---")
        print(f"标签数量 (num_labels): {config.get('num_labels')}")
        print(f"标签字典 (id2label): {config.get('id2label')}")
else:
    print(f"错误：在 {model_path} 没找到 config.json")