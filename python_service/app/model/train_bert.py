import os
import torch
import numpy as np

from datasets import Dataset
from transformers import (
    BertTokenizerFast,
    BertForTokenClassification,
    Trainer,
    TrainingArguments,
    DataCollatorForTokenClassification
)
from seqeval.metrics import classification_report

from app.core.paths import INPUT_ANNOTATED_DIR, NER_CHECKPOINT_DIR, NER_FINAL_MODEL_DIR


labels = ["O", "B-KP", "I-KP", "B-TASK", "I-TASK", "B-EXP", "I-EXP"]
label2id = {l: i for i, l in enumerate(labels)}
id2label = {i: l for i, l in enumerate(labels)}


def load_tsv(path):
    sents, tags = [], []
    cur_s, cur_t = [], []

    with open(path, encoding="utf-8") as f:
        for line in f:
            # 保留原始行的strip，但跳过空行
            line = line.strip()

            if line:
                # 关键修复：只分割1次，避免格式错误，同时检查是否有两列
                parts = line.split("\t", 1)  # 最多分割成2部分
                if len(parts) == 2:  # 必须有 文本\t标签 才处理
                    c, t = parts
                    cur_s.append(c)
                    cur_t.append(label2id[t])
                # 如果不是标准格式，直接跳过这一行，不报错
            else:
                if cur_s:
                    sents.append(cur_s)
                    tags.append(cur_t)
                    cur_s, cur_t = [], []

    return sents, tags

def compute_metrics(p):

    preds = np.argmax(p.predictions, axis=2)

    true_preds = []
    true_labels = []

    for pred, label in zip(preds, p.label_ids):

        cur_pred = []
        cur_label = []

        for p_, l_ in zip(pred, label):
            if l_ != -100:
                cur_pred.append(id2label[p_])
                cur_label.append(id2label[l_])

        true_preds.append(cur_pred)
        true_labels.append(cur_label)

    print(classification_report(true_labels, true_preds))
    return {}


def train():

    model_name = "bert-base-chinese"
    tokenizer = BertTokenizerFast.from_pretrained(model_name)

    train_s, train_t = load_tsv(str(INPUT_ANNOTATED_DIR / "train.tsv"))
    dev_s, dev_t = load_tsv(str(INPUT_ANNOTATED_DIR / "dev.tsv"))

    train_dataset = Dataset.from_dict({"tokens": train_s, "ner_tags": train_t})
    dev_dataset = Dataset.from_dict({"tokens": dev_s, "ner_tags": dev_t})

    def tokenize_and_align(examples):

        tokenized = tokenizer(
            examples["tokens"],
            is_split_into_words=True,
            truncation=True,
            max_length=128
        )

        aligned = []

        for i, label in enumerate(examples["ner_tags"]):

            word_ids = tokenized.word_ids(batch_index=i)

            prev = None
            label_ids = []

            for w in word_ids:

                if w is None:
                    label_ids.append(-100)

                elif w != prev:
                    label_ids.append(label[w])

                else:
                    label_ids.append(-100)

                prev = w

            aligned.append(label_ids)

        tokenized["labels"] = aligned
        return tokenized

    train_dataset = train_dataset.map(tokenize_and_align, batched=True)
    dev_dataset = dev_dataset.map(tokenize_and_align, batched=True)

    model = BertForTokenClassification.from_pretrained(
        model_name,
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id
    )

    args = TrainingArguments(
        output_dir=str(NER_CHECKPOINT_DIR / "train_runs"),
        num_train_epochs=6,
        per_device_train_batch_size=16,
        evaluation_strategy="epoch", 
        save_strategy="epoch",
        learning_rate=3e-5,
        logging_steps=20
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=dev_dataset,
        data_collator=DataCollatorForTokenClassification(tokenizer),
        compute_metrics=compute_metrics
    )

    trainer.train()

    NER_FINAL_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(NER_FINAL_MODEL_DIR))
    tokenizer.save_pretrained(str(NER_FINAL_MODEL_DIR))


if __name__ == "__main__":
    train()