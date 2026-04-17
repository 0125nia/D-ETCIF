import os
import re
import random
from app.model.data_source import DOMAIN_DICT
from app.core.paths import INPUT_PROCESSED_DIR, INPUT_ANNOTATED_DIR


NEG_KEEP_PROB = 0.3
ENTITY_DROP_PROB = 0.15
SPAN_TRUNCATE_PROB = 0.15


def perturb_span(word):
    if len(word) <= 2:
        return word
    
    if random.random() < SPAN_TRUNCATE_PROB:
        if random.random() < 0.5:
            return word[:-1]
        else:
            return word[1:]
    return word


def auto_tagging(text, domain_dict):

    all_words = []
    for label, words in domain_dict.items():
        for w in words:
            all_words.append((w, label))

    all_words.sort(key=lambda x: len(x[0]), reverse=True)

    chars = list(text)
    tags = ['O'] * len(chars)

    for word, label in all_words:

        if random.random() < ENTITY_DROP_PROB:
            continue

        word = perturb_span(word)

        for m in re.finditer(re.escape(word), text):
            start, end = m.start(), m.end()

            if end - start <= 0:
                continue

            if all(t == 'O' for t in tags[start:end]):
                tags[start] = f'B-{label}'
                for i in range(start + 1, end):
                    tags[i] = f'I-{label}'

    return chars, tags


def create_ner_data():

    txt_dir = str(INPUT_PROCESSED_DIR)
    save_dir = str(INPUT_ANNOTATED_DIR)
    os.makedirs(save_dir, exist_ok=True)

    all_data = []

    files = [f for f in os.listdir(txt_dir) if f.endswith('.txt')]

    for file in files:

        with open(os.path.join(txt_dir, file), 'r', encoding='utf-8') as f:
            content = f.read()

        sentences = re.split(r'[。！？；\n]', content)

        for sent in sentences:

            sent = sent.strip()

            if len(sent) < 5:
                continue

            chars, tags = auto_tagging(sent, DOMAIN_DICT)

            if any(t != 'O' for t in tags):
                all_data.append((chars, tags))
            else:
                if random.random() < NEG_KEEP_PROB:
                    all_data.append((chars, tags))

    random.shuffle(all_data)

    split = int(len(all_data) * 0.8)

    for name, data in [("train", all_data[:split]), ("dev", all_data[split:])]:

        with open(f"{save_dir}/{name}.tsv", 'w', encoding='utf-8') as f:

            for chars, tags in data:

                for c, t in zip(chars, tags):
                    f.write(f"{c}\t{t}\n")

                f.write("\n")

    print(f"数据生成完成，共 {len(all_data)} 条样本")

if __name__ == "__main__":
    create_ner_data()