import hanlp
from hanlp.components.ner.transformer_ner import TransformerNamedEntityRecognizer

recognizer = TransformerNamedEntityRecognizer()

# 开始微调
recognizer.fit(
    train_data='data/ner/train.tsv',
    dev_data='data/ner/dev.tsv', 
    save_dir='finetuned_models/ner_v1',
    transformer='bert-base-chinese',
    epochs=20,
    lr=2e-5,
    batch_size=8
)