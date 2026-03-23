import hanlp
from extraction.data_source import DOMAIN_DICT,ALIAS_MAP,STOP_WORDS,ACTION_REL_MAP



class KnowledgeEngine:
    def __init__(self):
        print("正在加载 M4 优化的 HanLP 模型...")
        self.pipeline = hanlp.load(hanlp.pretrained.mtl.CLOSE_TOK_POS_NER_SRL_DEP_SDP_CON_ELECTRA_SMALL_ZH)
        self.custom_ner = hanlp.load('finetuned_models/ner_matplotlib')
        
        # 这一步是关键：把导入的常量变成类属性
        self.domain_dict = set(DOMAIN_DICT) 
        self.stop_words = STOP_WORDS
        self.alias_map = ALIAS_MAP
        self.ACTION_REL_MAP = ACTION_REL_MAP
        
        try:
            if 'tok/fine' in self.pipeline.tasks:
                self.pipeline['tok/fine'].dict_combine = self.domain_dict
            elif 'tok' in self.pipeline.tasks:
                self.pipeline['tok'].dict_combine = self.domain_dict
        except Exception as e:
            print(f"词典挂载失败: {e}")

    def extract_logic(self, text):
        if not text or len(text.strip()) < 2:
            return []
            
        import re
        # 1. 预处理：分句
        sentences = [s.strip() for s in re.split(r'[。！\n]', text) if len(s.strip()) > 2]
        
        all_triples = []
        try:
            doc = self.pipeline(sentences)
        except Exception as e:
            print(f"推理异常: {e}")
            return []

        tok_key = next((k for k in doc.keys() if k.startswith('tok')), None)
        
        for i, sentence_tokens in enumerate(doc[tok_key]):
            current_sent_text = "".join(sentence_tokens)
            current_triples = [] # 格式: (h, r, t)
            custom_entities = self.custom_ner(current_sent_text)
            ner_found_nodes = [en['entity'] for en in custom_entities if self._is_valid_entity(en['entity'])]
            
            # --- 策略 A: 深度依存句法 (DEP) 扩展提取 ---
            if 'dep' in doc:
                sent_dep = doc['dep'][i]
                for idx, (gov, rel) in enumerate(sent_dep):
                    # 识别 宾语(obj)、属性(attr)、修饰(nmod)
                    if rel in ['obj', 'attr', 'nmod', 'root']:
                        target = sentence_tokens[idx]
                        source = sentence_tokens[gov-1] if gov > 0 else ""
                        if source and len(source) > 1 and len(target) > 1:
                            current_triples.append((source, rel, target))

            # --- 策略 B: 语义角色 (SRL) 提取 ---
            if 'srl' in doc and doc['srl'][i]:
                for pred in (doc['srl'][i][0] if isinstance(doc['srl'][i][0], list) else doc['srl'][i]):
                    if isinstance(pred, dict):
                        v = pred.get('predicate')
                        args = pred.get('arguments', [])
                        s, o = "", ""
                        for atype, atext in args:
                            if atype == 'ARG0': s = atext
                            if atype == 'ARG1': o = atext
                        if v and (s or o):
                            current_triples.append((s if s else v, v if s else "涉及", o if o else v))

            # --- 策略 C: 智能关键词滑动窗口 (终极保底) ---
            if not current_triples:
                # 核心词：原词典词 + 微调模型新发现的词
                combined_cores = list(set([w for w in sentence_tokens if w in self.domain_dict] + ner_found_nodes))
                other_found = [w for w in sentence_tokens if self._is_valid_entity(w) and w not in combined_cores]
                
                if combined_cores:
                    main_core = combined_cores[0]
                    for other in other_found:
                        current_triples.append((main_core, "关联", other))
                    if len(combined_cores) > 1:
                        for j in range(len(combined_cores)-1):
                            current_triples.append((combined_cores[j], "关联", combined_cores[j+1]))
                elif len(other_found) >= 2:
                    # 如果没有核心词，才执行链式关联
                    for j in range(len(other_found)-1):
                        current_triples.append((other_found[j], "关联", other_found[j+1]))

            # --- 2. 规范化与关系映射 ---
            for h, r, t in current_triples:
                norm_h = self._normalize(h)
                norm_t = self._normalize(t)
                
                if self._is_valid_entity(norm_h) and self._is_valid_entity(norm_t):
                    if norm_h == norm_t: continue
                    
                    refined_r = self._refine_relation(norm_h, r, norm_t, current_sent_text)
                    
                    if not refined_r:
                        print(f"DEBUG: 被 _refine_relation 过滤 -> {norm_h}-{r}-{norm_t}")
                    if refined_r:
                        all_triples.append({
                            "head": {"name": norm_h, "label": self._classify(norm_h)},
                            "relation": refined_r,
                            "tail": {"name": norm_t, "label": self._classify(norm_t)},
                            "metadata": {"source": current_sent_text, "confidence": 0.8}
                        })
                    
        # 去重处理
        unique_triples = { f"{t['head']['name']}-{t['relation']}-{t['tail']['name']}": t for t in all_triples }.values()
        return list(unique_triples)

    def _classify(self, name):
        # 1. 优先查表
        if name in ["Matplotlib", "Seaborn", "Pyecharts"]: return "Library"
        if "图" in name: return "ChartType"
        if "对象" in name or "轴" in name: return "Component"
        if "异常" in name or "报错" in name: return "ErrorStatus"
        
        # 2. 规则判断
        if any(k in name for k in ["plt.", "sns.", "df."]): return "Method"
        
        return "KnowledgePoint"
    

    def _normalize(self, name):
        # 去除常见的后缀干扰
        name = name.lower().replace("库", "").replace("函数", "").replace("方法", "").replace("类", "").strip()
        
        # 递归查找别名（ALIAS_MAP 里可以加 "绘制": "图表绘制"）
        while name in self.alias_map:
            new_name = self.alias_map[name]
            if new_name == name: break
            name = new_name
        return name

    def _refine_relation(self, h, r, t, sent_text):
        h_low, t_low = h.lower(), t.lower()
        
        # 领域命中：确保至少有一个词是专业词汇
        h_is_core = any(dw.lower() in h_low for dw in self.domain_dict)
        t_is_core = any(dw.lower() in t_low for dw in self.domain_dict)
        if not (h_is_core or t_is_core):
            return None 

        # --- 关键逻辑：识别动词并转化 ---
        # 检查句子中是否存在定义的动作词
        for action, rel_name in self.ACTION_REL_MAP.items():
            if action in sent_text:
                # 找到动作了，直接返回对应的关系名
                return rel_name

        # 如果没找到明确动作，但头尾都在领域词典里，给一个强关联
        if h_is_core and t_is_core:
            return "KNOWLEDGE_LINK"

        # 最后的兜底
        return "ASSOCIATED_WITH"


    def _is_valid_entity(self, name):
        # 1. 长度拦截
        if len(name) < 2: return False
        
        # 2. 数字拦截：只要包含数字，坚决不要（解决 7.1.1, 第7, 4.2 等问题）
        if any(char.isdigit() for char in name):
            return False
            
        # 3. 显式动词拦截：防止“绘制”、“设置”溜进节点表
        verb_garbage = {"绘制", "设置", "调用", "使用", "打好", "后续", "学习", "能够"}
        if name in verb_garbage:
            return False
            
        return True