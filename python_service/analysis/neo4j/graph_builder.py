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


class Neo4jGraphBuilder:
    def __init__(self):
        self.graph = self._connect()
        self.node_cache = {}

    def _connect(self):
        try:
            graph = Graph(
                NEO4J_CONFIG["uri"],
                auth=(NEO4J_CONFIG["user"], NEO4J_CONFIG["password"])
            )
            print("✅ Neo4j 连接成功")
            return graph
        except Exception as e:
            raise Exception(f"❌ Neo4j 连接失败：{e}")

    def clear(self):
        self.graph.delete_all()
        print("🗑️ 已清空旧图谱数据")

    def _judge_type(self, name):
        if any(k in name for k in ["错误", "不匹配", "报错", "异常"]):
            return "常见错误"
        elif any(k in name for k in ["导入", "创建", "准备", "绘制", "保存"]):
            return "实验步骤"
        elif any(k in name for k in ["规范", "禁止"]):
            return "安全规范"
        elif any(k in name for k in ["Matplotlib", "Seaborn", "Python"]):
            return "库工具"
        elif "语法" in name or "基础" in name:
            return "前置知识"
        else:
            return "知识点"

    def get_or_create(self, name):
        if name in self.node_cache:
            return self.node_cache[name]
        typ = self._judge_type(name)
        node = Node(typ, name=name)
        self.graph.create(node)
        self.node_cache[name] = node
        return node

    def build(self, triples):
        print("\n🚀 开始构建领域知识图谱...")
        for h, rel, t in triples:
            h_node = self.get_or_create(h)
            t_node = self.get_or_create(t)
            self.graph.create(Relationship(h_node, rel, t_node))
        print("✅ 领域知识图谱构建完成！")