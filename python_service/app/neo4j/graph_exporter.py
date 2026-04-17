# -*- coding: utf-8 -*-
import json
import os
from pathlib import Path
from py2neo import Graph
from dotenv import load_dotenv
from app.core.paths import ENV_FILE, GRAPH_EXPORTED_FILE, ensure_parent

# 加载环境变量
load_dotenv(dotenv_path=ENV_FILE, override=True)

class GraphExporter:
    def __init__(self):
        self.graph = Graph(
            os.getenv("NEO4J_URI"), 
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def export_all_relations(self, output_file=None):
        output_file = output_file or str(GRAPH_EXPORTED_FILE)
        # 1. 执行 Cypher 查询：匹配所有带关系的三元组
        # n: 头节点, r: 关系, m: 尾节点
        query = """
        MATCH (n)-[r]->(m)
        RETURN n, r, m
        """
        results = self.graph.run(query)

        exported_data = []

        print("正在从 Neo4j 提取数据...")
        for record in results:
            node_h = record['n']
            rel = record['r']
            node_t = record['m']

            # 2. 构造与你之前一致的 JSON 结构
            item = {
                "head": {
                    "name": node_h['name'],
                    "label": list(node_h.labels)[0] if node_h.labels else "KnowledgePoint"
                },
                "relation": type(rel).__name__,  # 获取关系的类型名称
                "tail": {
                    "name": node_t['name'],
                    "label": list(node_t.labels)[0] if node_t.labels else "KnowledgePoint"
                },
                "metadata": dict(rel) # 将关系上的属性（count, source等）转为字典
            }
            exported_data.append(item)

        # 3. 写入文件
        ensure_parent(Path(output_file))
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(exported_data, f, ensure_ascii=False, indent=4)
        
        print(f"✅ 成功导出 {len(exported_data)} 条关系至 {output_file}")

if __name__ == "__main__":
    exporter = GraphExporter()
    exporter.export_all_relations()