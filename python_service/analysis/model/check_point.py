import json
import os

model_path = "./d_etcif_model"
config_path = os.path.join(model_path, "config.json")

if os.path.exists(config_path):
    with open(config_path, "r") as f:
        config = json.load(f)
        print("--- 模型配置检查 ---")
        print(f"标签数量 (num_labels): {config.get('num_labels')}")
        print(f"标签字典 (id2label): {config.get('id2label')}")
else:
    print("错误：在 ./d_etcif_model 没找到 config.json")