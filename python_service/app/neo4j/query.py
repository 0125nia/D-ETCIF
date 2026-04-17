# -*- coding: utf-8 -*-
"""
图谱查询工具：验证节点、关系、知识点
"""

class GraphQuery:
    def __init__(self, graph):
        self.g = graph

    def show_knowledge_points(self):
        print("\n==== 所有知识点 ====")
        res = self.g.run("MATCH (n:知识点) RETURN n.name ORDER BY n.name")
        for i, r in enumerate(res, 1):
            print(f"{i}. {r['n.name']}")

    def show_errors(self):
        print("\n==== 所有常见错误 ====")
        res = self.g.run("MATCH (n:常见错误) RETURN n.name")
        for i, r in enumerate(res, 1):
            print(f"{i}. {r['n.name']}")