import hanlp
from hanlp.components.ner.transformer_ner import TransformerNamedEntityRecognizer

# 1. 配置加载预训练模型（作为基础）
recognizer = TransformerNamedEntityRecognizer()

# 2. 训练任务配置
save_dir = './ner_matplotlib'

recognizer.fit(
    train_data='../data/annotated/train.tsv',
    dev_data='../data/annotated/dev.tsv',
    save_dir=save_dir,
    transformer='bert-base-chinese', # 使用中文 BERT 作为底层
    epochs=10,
    lr=5e-5,
    batch_size=16
)

print(f"模型训练完成，保存在: {save_dir}")