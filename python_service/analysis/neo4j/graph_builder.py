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
        # 建议增加 name 参数方便调试
        self.graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def sync(self, data):
        print(f"正在同步 {len(data)} 条三元组至 Neo4j...")
        
        for item in data:
            try:
                h = item['head']
                t = item['tail']
                rel_type = item['relation']
                source = item.get('metadata', {}).get('source', 'unknown')

                # 使用双重花括号 {{ }} 来转义，这样 .format 之后才会剩下单层花括号给 Cypher
                query = f"""
                MERGE (h:{h['label']} {{name: $h_name}})
                MERGE (t:{t['label']} {{name: $t_name}})
                MERGE (h)-[r:{rel_type}]->(t)
                ON CREATE SET r.count = 1, r.source = $source
                ON MATCH SET r.count = r.count + 1
                """
                
                self.graph.run(
                    query, 
                    h_name=h['name'], 
                    t_name=t['name'], 
                    source=source
                )
            except Exception as e:
                print(f"同步单条数据失败: {e} | 数据: {item['head']['name']}->{item['tail']['name']}")
        
        print("Neo4j 同步完成！")