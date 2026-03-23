import os
import re
import random
from extraction.data_source import DOMAIN_DICT

def auto_tagging(text, domain_dict):
    # 将词典按长度排序，防止长词嵌套短词（比如 '3D散点图' 优先于 '散点图'）
    sorted_dict = sorted(list(domain_dict), key=len, reverse=True)
    
    # 初始化标签列表，全部设为 O
    chars = list(text)
    tags = ['O'] * len(chars)
    
    for word in sorted_dict:
        # 在句子中查找核心词的所有位置
        for m in re.finditer(re.escape(word), text):
            start, end = m.start(), m.end()
            # 检查该位置是否已经被标记过
            if all(t == 'O' for t in tags[start:end]):
                tags[start] = 'B-KP' # KnowledgePoint 简写为 KP
                for i in range(start + 1, end):
                    tags[i] = 'I-KP'
    return chars, tags

def create_tsv(files, train_path, dev_path):
    all_data = []
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            # 简单分句
            sentences = re.split(r'[。！\n]', content)
            for sent in sentences:
                sent = sent.strip()
                if len(sent) < 5 or re.match(r'^[\d\.]+', sent): continue
                chars, tags = auto_tagging(sent, DOMAIN_DICT)
                all_data.append((chars, tags))
    
    random.shuffle(all_data)
    split_idx = int(len(all_data) * 0.8)
    
    def save_set(data, path):
        with open(path, 'w', encoding='utf-8') as f:
            for chars, tags in data:
                for c, t in zip(chars, tags):
                    f.write(f"{c}\t{t}\n")
                f.write("\n") # 句子间空行

    save_set(all_data[:split_idx], train_path)
    save_set(all_data[split_idx:], dev_path)
    print(f"数据准备完毕！训练集: {train_path}, 验证集: {dev_path}")

# 执行生成
txt_files = [os.path.join("./data/processed", f) for f in os.listdir("./data/processed") if f.endswith('.txt')]
os.makedirs("data/ner", exist_ok=True)
create_tsv(txt_files, "data/ner/train.tsv", "data/ner/dev.tsv")