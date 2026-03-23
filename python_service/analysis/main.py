from extraction.knowledge_extractor import KnowledgeEngine
from neo4j.graph_builder import GraphStore
import json
import os


def load_real_data(file_path):
    """读取真实文本文件并进行基础预处理"""
    if not os.path.exists(file_path):
        print(f"找不到文件: {file_path}")
        return ""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        # 读取并按行处理，去掉首尾空格
        lines = [line.strip() for line in f.readlines() if len(line.strip()) > 5]
        return "\n".join(lines)

def batch_load_txt(dir_path):
    """扫描目录下所有 txt 文件并汇总内容"""
    if not os.path.exists(dir_path):
        print(f"目录不存在: {dir_path}")
        return []
    

    # 获取目录下所有 txt 文件
    files = [f for f in os.listdir(dir_path) if f.endswith('.txt')]
    print(f"发现 {len(files)} 个待处理文件...")
    return files

def sample_text():
    # 模拟读取 txt 资料
    sample_text = (
        "学生利用Matplotlib库绘制柱状图。绘制图表前必须导入绘图库。"
        "如果数据类型不匹配，则会导致程序报错。画布是绘图的基础。"
    )

    # 第一步：抽取
    engine = KnowledgeEngine()
    knowledge_json = engine.extract_logic(sample_text)

    # 第二步：保存为中间件 JSON (重要：用于答辩展示和二次清洗)
    with open('domain_kg.json', 'w', encoding='utf-8') as f:
        json.dump(knowledge_json, f, ensure_ascii=False, indent=4)
    print("JSON 数据已生成: domain_kg.json")

    # 第三步：入库
    store = GraphStore()
    store.sync(knowledge_json)
    print("领域知识图谱构建完成！")

def real_data():
    FOLDER_PATH = "./data/processed/"

    files = batch_load_txt(FOLDER_PATH)

    # print(files)
    
    for file in files:
        FILE_PATH = os.path.join(FOLDER_PATH, file)
        print(f" 正在加载语料: {FILE_PATH}")
        real_text = load_real_data(FILE_PATH)

        # 第一步：抽取
        engine = KnowledgeEngine()
        knowledge_json = engine.extract_logic(real_text)

        # 第二步：保存为中间件 JSON (重要：用于答辩展示和二次清洗)
        with open('domain_kg.json', 'w', encoding='utf-8') as f:
            json.dump(knowledge_json, f, ensure_ascii=False, indent=4)
        print("JSON 数据已生成: domain_kg.json")

        # 第三步：入库
        store = GraphStore()
        store.sync(knowledge_json)
        print("领域知识图谱构建完成！")


if __name__ == "__main__":
    # sample_text()
    real_data()






    

