from py2neo import Graph, Node, Relationship
import os
from dotenv import load_dotenv
from app.core.paths import ENV_FILE

load_dotenv(dotenv_path=ENV_FILE, override=True)


class KGBuilder:

    def __init__(self,
                 uri=None,
                 user=None,
                 password=None):

        uri = uri or os.getenv("NEO4J_URI")
        user = user or os.getenv("NEO4J_USER")
        password = password or os.getenv("NEO4J_PASSWORD")
        if not uri or not user or not password:
            raise ValueError("NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD are required")

        self.graph = Graph(uri, auth=(user, password))

    def insert_triplet(self, exp, rel, obj):

        exp_node = Node("Experiment", name=exp)

        if rel == "包含知识点":

            obj_node = Node("KnowledgePoint", name=obj)
            rel_obj = Relationship(exp_node, "HAS_KP", obj_node)

        elif rel == "包含任务":

            obj_node = Node("Task", name=obj)
            rel_obj = Relationship(exp_node, "HAS_TASK", obj_node)

        else:
            return

        # merge节点
        self.graph.merge(exp_node, "Experiment", "name")

        if rel == "包含知识点":
            self.graph.merge(obj_node, "KnowledgePoint", "name")

        elif rel == "包含任务":
            self.graph.merge(obj_node, "Task", "name")

        # merge关系
        self.graph.merge(rel_obj)


if __name__ == "__main__":

    triplets = [
        ('实验1', '包含知识点', '折线图'),
        ('实验1', '包含任务', '导入 pandas'),
        ('实验1', '包含任务', '读取 csv 数据'),
        ('实验1', '包含任务', '使用 plot 绘图')
    ]

    builder = KGBuilder()

    for t in triplets:
        builder.insert_triplet(*t)

    print("KG构建完成")
