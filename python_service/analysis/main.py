from extraction.knowledge_extractor import KnowledgeEngine
from neo4j.graph_builder import GraphStore
import json

if __name__ == "__main__":
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