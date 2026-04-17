import json
import os
from dotenv import load_dotenv
from py2neo import Graph, Node, Relationship
from app.core.paths import ENV_FILE, EXPERIMENT_GRAPH_BOOTSTRAP_FILE

load_dotenv(dotenv_path=ENV_FILE, override=True)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

# 连接数据库
graph = Graph(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def clear_database():
    """清空数据库所有节点和关系（谨慎使用）"""
    confirm = input("即将清空 Neo4j 所有数据，确认继续？(yes/no): ")
    if confirm.lower() == "yes":
        graph.delete_all()
        print("数据库已清空")
    else:
        print("取消清空操作")
        exit()

def load_json_data(file_path):
    """加载 JSON 数据文件"""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def create_constraints():
    """创建唯一约束（避免重复创建节点）"""
    constraints = [
        ("Experiment", "expId"),
        ("KnowledgePoint", "kpId"),
        ("CourseResource", "resId"),
        ("ExperimentTask", "taskId"),
        ("ExamQuestion", "qId")
    ]
    for label, key in constraints:
        try:
            graph.run(f"CREATE CONSTRAINT {label}_{key}_unique FOR (n:{label}) REQUIRE n.{key} IS UNIQUE")
            print(f"创建约束: {label}.{key}")
        except Exception as e:
            print(f"约束已存在或跳过: {label}.{key}")

def import_nodes(data):
    """导入所有节点"""
    node_mappings = {
        "experiments": "实验",
        "knowledge_points": "知识点",
        "course_resources": "课程资源",
        "experiment_tasks": "实验操作题",
        "exam_questions": "课后题"
    }

    for key, desc in node_mappings.items():
        count = 0
        for item in data[key]:
            # 使用 merge 避免重复创建（通过唯一属性匹配）
            node = Node(*item["labels"], **item["properties"])
            graph.merge(node, item["labels"][0], list(item["properties"].keys())[0])
            count += 1
        print(f"✅ 导入 {desc} 节点: {count} 个")

def import_knowledge_relations(data):
    """导入知识点前置关系 (PRE_KP)"""
    count = 0
    for rel in data["knowledge_relations"]:
        # 匹配起点和终点节点
        from_node = graph.nodes.match("KnowledgePoint", kpId=rel["from_kpId"]).first()
        to_node = graph.nodes.match("KnowledgePoint", kpId=rel["to_kpId"]).first()
        
        if from_node and to_node:
            relationship = Relationship(from_node, rel["type"], **rel["properties"])
            graph.merge(relationship)
            count += 1
    print(f"✅ 导入知识点前置关系: {count} 个")

def import_resource_relations(data):
    """导入资源相关关系 (HAS_RESOURCE, BELONG_TO)"""
    # 1. 实验 -[:HAS_RESOURCE]-> 资源
    has_resource_count = 0
    for item in data["resource_relations"]["exp_has_resource"]:
        exp_node = graph.nodes.match("Experiment", expId=item["expId"]).first()
        res_node = graph.nodes.match("CourseResource", resId=item["resId"]).first()
        if exp_node and res_node:
            graph.merge(Relationship(exp_node, "HAS_RESOURCE", res_node))
            has_resource_count += 1
    
    # 2. 资源 -[:BELONG_TO]-> 知识点
    belong_to_count = 0
    for item in data["resource_relations"]["resource_belong_kp"]:
        res_node = graph.nodes.match("CourseResource", resId=item["resId"]).first()
        if res_node:
            for kp_id in item["kpIds"]:
                kp_node = graph.nodes.match("KnowledgePoint", kpId=kp_id).first()
                if kp_node:
                    graph.merge(Relationship(res_node, "BELONG_TO", kp_node))
                    belong_to_count += 1
    
    print(f"✅ 导入实验-资源关系: {has_resource_count} 个")
    print(f"✅ 导入资源-知识点关系: {belong_to_count} 个")

def import_task_relations(data):
    """导入实验题相关关系 (HAS_TASK, TEST_KP)"""
    # 1. 实验 -[:HAS_TASK]-> 实验题
    has_task_count = 0
    for item in data["task_relations"]["exp_has_task"]:
        exp_node = graph.nodes.match("Experiment", expId=item["expId"]).first()
        task_node = graph.nodes.match("ExperimentTask", taskId=item["taskId"]).first()
        if exp_node and task_node:
            graph.merge(Relationship(exp_node, "HAS_TASK", task_node))
            has_task_count += 1
    
    # 2. 实验题 -[:TEST_KP]-> 知识点
    test_kp_count = 0
    for item in data["task_relations"]["task_test_kp"]:
        task_node = graph.nodes.match("ExperimentTask", taskId=item["taskId"]).first()
        if task_node:
            for kp_id in item["kpIds"]:
                kp_node = graph.nodes.match("KnowledgePoint", kpId=kp_id).first()
                if kp_node:
                    graph.merge(Relationship(task_node, "TEST_KP", kp_node))
                    test_kp_count += 1
    
    print(f"✅ 导入实验-实验题关系: {has_task_count} 个")
    print(f"✅ 导入实验题-知识点关系: {test_kp_count} 个")

def import_question_relations(data):
    """导入课后题相关关系 (HAS_QUESTION, TEST_KP)"""
    # 1. 实验 -[:HAS_QUESTION]-> 课后题
    has_question_count = 0
    for item in data["question_relations"]["exp_has_question"]:
        exp_node = graph.nodes.match("Experiment", expId=item["expId"]).first()
        q_node = graph.nodes.match("ExamQuestion", qId=item["qId"]).first()
        if exp_node and q_node:
            graph.merge(Relationship(exp_node, "HAS_QUESTION", q_node))
            has_question_count += 1
    
    # 2. 课后题 -[:TEST_KP]-> 知识点
    test_kp_count = 0
    for item in data["question_relations"]["question_test_kp"]:
        q_node = graph.nodes.match("ExamQuestion", qId=item["qId"]).first()
        if q_node:
            for kp_id in item["kpIds"]:
                kp_node = graph.nodes.match("KnowledgePoint", kpId=kp_id).first()
                if kp_node:
                    graph.merge(Relationship(q_node, "TEST_KP", kp_node))
                    test_kp_count += 1
    
    print(f"✅ 导入实验-课后题关系: {has_question_count} 个")
    print(f"✅ 导入课后题-知识点关系: {test_kp_count} 个")

# ====================== 主执行流程 ======================
if __name__ == "__main__":
    # 1. 配置检查
    print("="*50)
    print("🚀 开始导入实验1数据到 Neo4j")
    print("="*50)
    
    # 2. 可选：清空数据库
    # clear_database()  # 如需清空请取消注释
    
    # 3. 加载数据
    json_file = str(EXPERIMENT_GRAPH_BOOTSTRAP_FILE)
    print(f"\n📂 加载数据文件: {json_file}")
    data = load_json_data(json_file)
    
    # 4. 创建约束
    print("\n🔧 创建唯一约束...")
    create_constraints()
    
    # 5. 导入节点
    print("\n📦 导入节点数据...")
    import_nodes(data)
    
    # 6. 导入关系
    print("\n🔗 导入关系数据...")
    import_knowledge_relations(data)
    import_resource_relations(data)
    import_task_relations(data)
    import_question_relations(data)
    
    # 7. 完成
    print("\n" + "="*50)
    print("🎉 所有数据导入完成！")
    print("="*50)