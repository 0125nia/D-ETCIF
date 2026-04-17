from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# 导入Node2Vec分析器
from app.node2vec.node2vec_analyzer import Node2VecAnalyzer
from app.core.paths import ENV_FILE, NODE2VEC_MODEL_PATH

# 加载环境变量
load_dotenv(dotenv_path=ENV_FILE)

# 初始化Node2Vec分析器
neo4j_url = os.getenv("NEO4J_URI", "bolt://localhost:7687")
neo4j_user = os.getenv("NEO4J_USER", "neo4j")
neo4j_password = os.getenv("NEO4J_PASSWORD", "password")

analyzer = Node2VecAnalyzer(
    neo4j_url=neo4j_url,
    neo4j_auth=(neo4j_user, neo4j_password),
    model_path=str(NODE2VEC_MODEL_PATH),
)

# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    print("正在构建图结构...")
    analyzer.build_graph()
    # 如果本地已有模型则直接加载，避免每次启动重训
    analyzer.load_model(str(NODE2VEC_MODEL_PATH))
    print("服务启动完成！")
    yield
    # 关闭时执行
    print("服务正在关闭...")

# 初始化FastAPI应用
app = FastAPI(
    title="D-ETCIF 资源推荐服务",
    description="基于Node2Vec的智能资源推荐API",
    version="1.0.0",
    lifespan=lifespan
)

# 请求模型
class RecommendationRequest(BaseModel):
    student_id: str
    topk: int = 3
    weak_threshold: float = 0.6

# 响应模型
class Resource(BaseModel):
    name: str
    score: float

class RecommendationResponse(BaseModel):
    weak_points: list[str]
    recommendations: dict[str, list[Resource]]

# 健康检查
@app.get("/healthz")
def health_check():
    """健康检查接口"""
    return {"ok": True}

# 资源推荐接口
@app.post("/api/v1/recommend", response_model=RecommendationResponse)
def recommend_resources(request: RecommendationRequest):
    """
    根据 student_id 自动推断薄弱点并推荐资源
    
    Args:
        student_id: 学生ID
        topk: 每个知识点推荐的资源数量
    
    Returns:
        包含薄弱知识点及其对应推荐资源
    """
    try:
        weak_points = analyzer.infer_weak_knowledge_points(
            student_id=request.student_id,
            threshold=request.weak_threshold,
            limit=request.topk,
        )

        # 生成推荐（如果模型不存在，会自动训练）
        recommendations = analyzer.generate_recommendations(
            weak_kps=weak_points,
            topk=request.topk
        )
        
        # 转换为响应格式
        formatted_recommendations = {}
        for kp, resources in recommendations.items():
            formatted_resources = [
                Resource(name=res, score=score)
                for res, score in resources
            ]
            formatted_recommendations[kp] = formatted_resources
        
        return RecommendationResponse(
            weak_points=weak_points,
            recommendations=formatted_recommendations,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推荐过程中出错: {str(e)}")

# 主函数
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )