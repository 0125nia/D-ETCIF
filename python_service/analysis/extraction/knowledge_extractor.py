import hanlp
from extraction.data_source import DOMAIN_DICT,ALIAS_MAP

class KnowledgeEngine:
    def __init__(self):
        print("正在加载 M4 优化的 HanLP 模型...")
        # 加载模型
        self.pipeline = hanlp.load(hanlp.pretrained.mtl.CLOSE_TOK_POS_NER_SRL_DEP_SDP_CON_ELECTRA_SMALL_ZH)
        try:
            # 尝试最通用的 MTL 词典设置方式
            if 'tok/fine' in self.pipeline.tasks:
                self.pipeline['tok/fine'].dict_combine = set(DOMAIN_DICT)
            elif 'tok' in self.pipeline.tasks:
                self.pipeline['tok'].dict_combine = set(DOMAIN_DICT)
            else:
                # 如果找不到任务 key，则跳过词典合并，先保证程序跑通
                print("未能自动挂载领域词典，将使用标准分词")
        except Exception as e:
            print(f"词典挂载失败: {e}")
        self.alias_map = ALIAS_MAP

    def extract_logic(self, text):
        if not text or len(text.strip()) < 2:
            return []
            
        # 1. 预处理：将长段落切分为单句（这是解决“关系全变CAUSE_ERROR”的关键）
        import re
        sentences = [s.strip() for s in re.split(r'[。！\n]', text) if len(s.strip()) > 2]
        
        all_triples = []
        try:
            doc = self.pipeline(sentences)
        except Exception as e:
            print(f"❌ 模型推理异常: {e}")
            return []

        tok_key = next((k for k in doc.keys() if k.startswith('tok')), None)
        
        for i, sentence_tokens in enumerate(doc[tok_key]):
            current_sentence_text = "".join(sentence_tokens)
            current_triples = []
            
            # --- 策略 A: 依存句法 (DEP) 提取主谓宾 (最精准) ---
            if 'dep' in doc:
                sent_dep = doc['dep'][i]
                for head_idx, (governor, dep_rel) in enumerate(sent_dep):
                    if dep_rel == 'obj': 
                        verb_idx = governor - 1
                        if 0 <= verb_idx < len(sentence_tokens):
                            verb = sentence_tokens[verb_idx]
                            obj = sentence_tokens[head_idx]
                            # 查找主语
                            for sub_idx, (sub_gov, sub_rel) in enumerate(sent_dep):
                                if sub_gov == verb_idx + 1 and sub_rel == 'nsubj':
                                    subj = sentence_tokens[sub_idx]
                                    current_triples.append((subj, verb, obj))

            # --- 策略 B: 如果 DEP 没抓到，用关键词邻近 (保底) ---
            if not current_triples:
                # 仅在当前句内寻找关键词
                kws = [w for w in sentence_tokens if w in DOMAIN_DICT or len(w) > 2]
                if len(kws) >= 2:
                    current_triples.append((kws[0], "关联", kws[1]))

            # --- 2. 关系精细化映射 ---
        for h, r, t in current_triples:
            # 增加规范化步骤
            norm_h = self._normalize(h)
            norm_t = self._normalize(t)
            
            if norm_h == norm_t: continue # 过滤自循环
            
            all_triples.append({
                "head": {"name": norm_h, "label": self._classify(norm_h)},
                "relation": self._refine_relation(norm_h, r, norm_t, current_sentence_text),
                "tail": {"name": norm_t, "label": self._classify(norm_t)},
                "metadata": {"source": current_sentence_text, "confidence": 0.8}
            })
                    
        return all_triples

    def _classify(self, name):
        """实体类型自动分类，服务于双层图谱映射"""
        if any(k in name for k in ["错误", "失败", "异常", "不匹配"]): return "ErrorLog"
        if any(k in name for k in ["规范", "禁止", "必须"]): return "SafetyRule"
        if any(k in name.lower() for k in ["matplotlib", "plt", "python", "库"]): return "Tool"
        return "KnowledgePoint"
    
    def _normalize(self, name):
        """将同义词统一为标准词，并去掉冗余字符"""
        name = name.lower().replace("调用", "").replace("函数", "").strip()
        return self.alias_map.get(name, name)

    def _refine_relation(self, h, r, t, sent_text):
        """根据当前句的内容精准定义关系"""
        # 错误逻辑：当前句必须包含错误词
        if any(w in sent_text for w in ["报错", "失败", "错误", "不匹配"]):
            return "CAUSE_ERROR"
        # 依赖逻辑
        if "必须" in sent_text or "导入" in sent_text:
            return "PREREQUISITE"
        # 包含逻辑
        if h.lower() in ["matplotlib", "plt"] or "库" in h:
            return "CONTAIN_COMPONENT"
        # 动作逻辑
        if r in ["绘制", "创建", "调用"]:
            return "EXECUTE_ACTION"
            
        return "ASSOCIATED_WITH"