import json
import os
from transformers import BertConfig, BertForTokenClassification

from app.core.paths import NER_FINAL_MODEL_DIR

model_path = str(NER_FINAL_MODEL_DIR)

# 1. 定义正确的映射
labels = ["O", "B-KP", "I-KP", "B-TASK", "I-TASK", "B-EXP", "I-EXP"]
label2id = {l: i for i, l in enumerate(labels)}
id2label = {i: l for i, l in enumerate(labels)}

print("正在强制修正模型配置...")

# 2. 加载现有模型并注入正确的配置
try:
    # 强制指定配置加载
    config = BertConfig.from_pretrained(
        "bert-base-chinese",
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id
    )
    
    # 加载权重
    model = BertForTokenClassification.from_pretrained(model_path, config=config)
    
    # 3. 覆盖保存
    model.save_pretrained(model_path)
    print("修正完成！num_labels 现在已设为 7，且 id2label 已转为标准格式。")
    
except Exception as e:
    print(f"修正失败: {e}")