import json
from collections import defaultdict

def clean_knowledge_graph(input_file, output_file):
    # 1. 加载数据
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    # 2. 定义关系优先级 (数值越大越优先)
    RELATION_PRIORITY = {
        'UTILIZE': 10,
        'CONTAINS': 10,
        'SET_PROPERTIES': 9,
        'CALL_METHOD': 9,
        'VISUALIZE_BY': 7,
        'KNOWLEDGE_LINK': 5,
        'ASSOCIATED_WITH': 1
    }

    # 用于存储最强关系的容器
    # Key 格式: (frozenset([node_a, node_b])) -> 保证 A-B 和 B-A 被视为同一对
    processed_edges = {}

    for item in raw_data:
        head_name = item['head']['name']
        tail_name = item['tail']['name']
        rel = item['relation']
        
        # 基础过滤：跳过自环（头尾相同）
        if head_name == tail_name:
            continue

        # 创建一个不分方向的唯一 Key，用来处理对称关系
        edge_key = frozenset([head_name, tail_name])
        
        # 获取当前关系的权重
        current_weight = RELATION_PRIORITY.get(rel, 0)

        # 逻辑判定：
        # 如果这对节点还没记录过，或者当前关系比记录过的更“高级”，则更新
        if edge_key not in processed_edges:
            processed_edges[edge_key] = item
        else:
            existing_rel = processed_edges[edge_key]['relation']
            existing_weight = RELATION_PRIORITY.get(existing_rel, 0)
            
            if current_weight > existing_weight:
                processed_edges[edge_key] = item
            elif current_weight == existing_weight:
                # 如果优先级相同，保留 count 较高的（即证据更多的）
                if item['metadata'].get('count', 1) > processed_edges[edge_key]['metadata'].get('count', 1):
                    processed_edges[edge_key] = item

    # 3. 导出清洗后的数据
    cleaned_data = list(processed_edges.values())
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=4)

    print(f"清洗完成！原始三元组: {len(raw_data)} | 清洗后: {len(cleaned_data)}")

if __name__ == "__main__":
    clean_knowledge_graph('exported_domain_kg.json', 'cleaned_domain_kg.json')