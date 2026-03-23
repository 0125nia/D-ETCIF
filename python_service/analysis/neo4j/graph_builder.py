# -*- coding: utf-8 -*-
"""
Neo4j 图数据库构建：节点创建 + 关系写入
"""
from py2neo import Graph, Node, Relationship
import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv(override=True)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

NEO4J_CONFIG = {
    "uri": NEO4J_URI,
    "user": NEO4J_USER,
    "password": NEO4J_PASSWORD
}

class GraphStore:
    def __init__(self):
        self.graph = Graph(NEO4J_CONFIG["uri"], auth=(NEO4J_CONFIG["user"], NEO4J_CONFIG["password"]))

    def sync(self, data):
        print(f"📦 正在同步 {len(data)} 条三元组至 Neo4j...")
        for item in data:
            h, t = item['head'], item['tail']
            # 创建/合并节点
            node_h = Node(h['label'], name=h['name'])
            node_t = Node(t['label'], name=t['name'])
            self.graph.merge(node_h, h['label'], "name")
            self.graph.merge(node_t, t['label'], "name")
            # 创建/合并关系
            rel = Relationship(node_h, item['relation'], node_t)
            self.graph.merge(rel)