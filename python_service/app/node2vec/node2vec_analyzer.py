import networkx as nx
from node2vec import Node2Vec
from py2neo import Graph
from gensim.models import Word2Vec
import logging
import os
from pathlib import Path

from app.core.paths import NODE2VEC_MODEL_PATH, ensure_parent

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def build_graph(neo4j_url="bolt://localhost:7687", neo4j_auth=('neo4j', 'password')):

    try:
        logging.info("开始从Neo4j构建图结构...")
        graph_db = Graph(neo4j_url, auth=neo4j_auth)
        # 先做连通性探测，避免后续查询时报不明确的连接关闭错误
        graph_db.run("RETURN 1").evaluate()

        query = """
        MATCH (a)-[r]->(b)
        RETURN 
          CASE labels(a)[0]
            WHEN 'KnowledgePoint' THEN a.kpName
            WHEN 'CourseResource' THEN a.resName
            WHEN 'ExperimentTask' THEN a.taskName
            WHEN 'ExamQuestion' THEN a.question
            WHEN 'Experiment' THEN a.expName
            ELSE id(a)
          END AS src,
          CASE labels(b)[0]
            WHEN 'KnowledgePoint' THEN b.kpName
            WHEN 'CourseResource' THEN b.resName
            WHEN 'ExperimentTask' THEN b.taskName
            WHEN 'ExamQuestion' THEN b.question
            WHEN 'Experiment' THEN b.expName
            ELSE id(b)
          END AS dst,
          labels(a)[0] AS src_type,
          labels(b)[0] AS dst_type,
          COALESCE(r.weight, 1.0) AS weight
        """
        
        data = graph_db.run(query)
        
        G = nx.Graph()
        node_type = {}
        
        for record in data:
            src = str(record["src"])
            dst = str(record["dst"])
            weight = float(record["weight"])
            
            # 添加带权重的边
            G.add_edge(src, dst, weight=weight)
            
            # 记录节点类型
            node_type[src] = record["src_type"]
            node_type[dst] = record["dst_type"]
        
        logging.info(f"图结构构建完成，节点数: {len(G.nodes())}, 边数: {len(G.edges())}")
        return G, node_type
        
    except Exception as e:
        logging.error(f"构建图结构时出错: {str(e)}")
        return nx.Graph(), {}


def train_node2vec(G, dimensions=64, walk_length=15, num_walks=30, p=1, q=1, workers=4, window=5, min_count=1, batch_words=4):
    """
    训练Node2Vec模型
    """
    try:
        logging.info("开始训练Node2Vec模型...")
        logging.info(f"模型参数: dimensions={dimensions}, walk_length={walk_length}, num_walks={num_walks}")
        
        if len(G.nodes()) == 0:
            logging.warning("图结构为空，无法训练模型")
            return None
        
        node2vec = Node2Vec(
            G,
            dimensions=dimensions,
            walk_length=walk_length,
            num_walks=num_walks,
            p=p,
            q=q,
            workers=workers,
            weight_key="weight"  # 使用边的weight属性
        )
        try:
            model = node2vec.fit(
                window=window,
                min_count=min_count,
                batch_words=batch_words
            )
        except TypeError as te:
            # 兼容旧版 node2vec + 新版 gensim(>=4) 的 size/vector_size 参数差异
            if "unexpected keyword argument 'size'" not in str(te):
                raise

            logging.warning("检测到 node2vec 与 gensim 参数不兼容，使用兼容模式训练 Word2Vec")
            model = Word2Vec(
                sentences=node2vec.walks,
                vector_size=dimensions,
                window=window,
                min_count=min_count,
                sg=1,
                workers=workers,
                batch_words=batch_words,
            )
        
        logging.info("Node2Vec模型训练完成")
        return model
        
    except Exception as e:
        logging.error(f"训练Node2Vec模型时出错: {str(e)}")
        return None

def save_model(model, model_path):
    """保存模型"""
    try:
        logging.info(f"保存模型到: {model_path}")
        ensure_parent(Path(model_path))
        model.save(model_path)
        logging.info("模型保存成功")
    except Exception as e:
        logging.error(f"保存模型时出错: {str(e)}")

def load_model(model_path):
    """加载模型"""
    try:
        logging.info(f"从{model_path}加载模型...")
        model = Word2Vec.load(model_path)
        logging.info("模型加载成功")
        return model
    except Exception as e:
        logging.error(f"加载模型时出错: {str(e)}")
        return None


def recommend_resources(model, node_type, kp_name, topk=3):
    """
    为指定知识点推荐相关课程资源
    """
    try:
        if model is None:
            logging.warning("模型为空，无法执行资源推荐")
            return []
        if not node_type:
            logging.warning("节点类型索引为空，无法执行资源推荐")
            return []

        logging.info(f"为知识点「{kp_name}」推荐资源...")
        # 获取所有相似节点
        all_similar = model.wv.most_similar(kp_name, topn=20)
        
        # 只保留CourseResource类型的节点
        resources = [
            (node, score)
            for node, score in all_similar
            if node_type.get(node) == "CourseResource"
        ]
        
        recommended = resources[:topk]
        logging.info(f"推荐了 {len(recommended)} 个资源")
        return recommended
    except KeyError:
        logging.warning(f"知识点「{kp_name}」不存在")
        return []
    except Exception as e:
        logging.error(f"推荐资源时出错: {str(e)}")
        return []

def generate_recommendations(model, node_type, weak_kps, topk=3):
    """
    为多个薄弱知识点生成推荐
    """
    try:
        if model is None:
            logging.warning("模型为空，跳过推荐生成")
            return {}
        if not node_type:
            logging.warning("节点类型索引为空，跳过推荐生成")
            return {}

        logging.info("开始生成资源推荐...")
        recommendations = {}
        for kp in weak_kps:
            resources = recommend_resources(model, node_type, kp, topk)
            if resources:
                recommendations[kp] = resources
        
        logging.info(f"生成了 {len(recommendations)} 个知识点的资源推荐")
        return recommendations
    except Exception as e:
        logging.error(f"生成推荐时出错: {str(e)}")
        return {}


class Node2VecAnalyzer:
    def __init__(self, neo4j_url="bolt://localhost:7687", neo4j_auth=None, model_path=None):
        self.neo4j_url = neo4j_url
        if neo4j_auth is None:
            self.neo4j_auth = (
                os.getenv("NEO4J_USER", "neo4j"),
                os.getenv("NEO4J_PASSWORD", "password"),
            )
        else:
            self.neo4j_auth = neo4j_auth
        self.model_path = model_path or str(NODE2VEC_MODEL_PATH)
        self.graph = None
        self.node_type = None
        self.model = None
    
    def build_graph(self):
        self.graph, self.node_type = build_graph(self.neo4j_url, self.neo4j_auth)
        return self.graph, self.node_type
    
    def train_model(self, **kwargs):
        if self.graph is None:
            self.build_graph()
        if self.graph is None or len(self.graph.nodes()) == 0:
            logging.warning("图结构为空，跳过模型训练")
            self.model = None
            return None
        self.model = train_node2vec(self.graph, **kwargs)
        return self.model
    
    def save_model(self, model_path):
        if self.model:
            save_model(self.model, model_path)
    
    def load_model(self, model_path):
        self.model = load_model(model_path)
        return self.model
    
    def generate_recommendations(self, weak_kps, topk=3):
        if self.model is None:
            if os.path.exists(self.model_path):
                self.load_model(self.model_path)
            else:
                self.train_model()
        if self.model is None:
            logging.warning("模型未就绪，无法生成推荐")
            return {}
        if not os.path.exists(self.model_path):
            self.save_model(self.model_path)
        return generate_recommendations(self.model, self.node_type, weak_kps, topk)


if __name__ == "__main__":
    analyzer = Node2VecAnalyzer(neo4j_url="bolt://localhost:7687")
    
    # 2. 构建图（从Neo4j拉取训练数据）
    analyzer.build_graph()

    if analyzer.graph is None or len(analyzer.graph.nodes()) == 0:
        logging.error("图构建失败或为空，请检查 Neo4j 服务、地址与账号密码后重试")
        raise SystemExit(1)
    
    # 3. 训练模型
    analyzer.train_model()

    if analyzer.model is None:
        logging.error("模型训练失败，流程终止")
        raise SystemExit(1)
    
    # 4. 保存模型（下次直接加载，不用重新训练）
    analyzer.save_model(str(NODE2VEC_MODEL_PATH))
    
    # 5. 模拟一个学生的薄弱知识点（替换为你系统的真实数据）
    student_weak_kps = [
        "数据可视化的定义与作用",
        "12种常见可视化图表类型"
    ]
    
    # 6. 生成推荐
    recommendations = analyzer.generate_recommendations(student_weak_kps, topk=3)
    
    # 7. 打印结果
    print("\n" + "="*60)
    print("推荐结果")
    print("="*60)
    for kp, resources in recommendations.items():
        print(f"\n薄弱知识点：{kp}")
        for i, (res, score) in enumerate(resources, 1):
            print(f"   {i}. {res}（相似度：{score:.4f}）")