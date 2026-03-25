import json
import os
from py2neo import Graph
from dotenv import load_dotenv

# 1. 配置加载
load_dotenv(override=True)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

class GraphRebuilder:
    def __init__(self):
        # 初始化连接
        self.graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        # 关系优先级定义 (用于清洗)
        self.REL_PRIORITY = {
            'UTILIZE': 10, 'CONTAINS': 10, 'SET_PROPERTIES': 9, 
            'CALL_METHOD': 9, 'VISUALIZE_BY': 7, 'KNOWLEDGE_LINK': 5, 'ASSOCIATED_WITH': 1
        }

    def clear_database(self):
        """危险操作：清空 Neo4j 所有节点和关系"""
        print("正在清空数据库...")
        # DETACH DELETE 会同时删除节点及其相连的关系
        self.graph.run("MATCH (n) DETACH DELETE n")
        print("数据库已清空。")

    def _clean_data(self, raw_data):
        """在导入前进行数据清洗：去重并保留高级关系"""
        processed_edges = {}
        for item in raw_data:
            h_name, t_name = item['head']['name'], item['tail']['name']
            if h_name == t_name: continue
            
            # 使用 frozenset 忽略方向进行去重
            edge_key = frozenset([h_name, t_name])
            current_weight = self.REL_PRIORITY.get(item['relation'], 0)
            
            if edge_key not in processed_edges:
                processed_edges[edge_key] = item
            else:
                existing_weight = self.REL_PRIORITY.get(processed_edges[edge_key]['relation'], 0)
                if current_weight > existing_weight:
                    processed_edges[edge_key] = item
        return list(processed_edges.values())

    def rebuild(self, json_file):
        # 读取数据
        if not os.path.exists(json_file):
            print(f"找不到文件: {json_file}")
            return
            
        with open(json_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        # 执行步骤
        # self.clear_database()
        # cleaned_data = self._clean_data(raw_data)
        cleaned_data = raw_data  
        
        print(f"开始同步 {len(cleaned_data)} 条优质三元组...")
        
        for item in cleaned_data:
            h, t = item['head'], item['tail']
            rel_type = item['relation']
            source = item.get('metadata', {}).get('source', 'unknown')

            # 使用参数化查询防止注入，提高性能
            query = f"""
            MERGE (h:{h['label']} {{name: $h_name}})
            MERGE (t:{t['label']} {{name: $t_name}})
            MERGE (h)-[r:{rel_type}]->(t)
            ON CREATE SET r.source = $source, r.count = 1
            ON MATCH SET r.count = r.count + 1
            """
            try:
                self.graph.run(query, h_name=h['name'], t_name=t['name'], source=source)
            except Exception as e:
                print(f"同步失败: {h['name']} -> {t['name']} | 错误: {e}")

        print("数据库重构完成！")

if __name__ == "__main__":
    rebuilder = GraphRebuilder()
    # 填入你的 JSON 文件路径
    rebuilder.rebuild('./cleaned_domain_kg.json')