import hanlp
import re
from extraction.data_source import DOMAIN_DICT, ALIAS_MAP, ACTION_REL_MAP

class KnowledgeEngine:
    def __init__(self):
        print("正在加载优化版模型...")
        # 仅加载必要的 MTL 任务，减少内存占用
        self.pipeline = hanlp.load(hanlp.pretrained.mtl.CLOSE_TOK_POS_NER_SRL_DEP_SDP_CON_ELECTRA_SMALL_ZH)
        # 预加载集合以提高查询速度
        self.domain_dict = set(DOMAIN_DICT)
        self.alias_map = ALIAS_MAP
        # 挂载用户词典
        if 'tok' in self.pipeline.tasks:
            self.pipeline['tok'].dict_combine = self.domain_dict

    def extract_logic(self, text):
        if not text or len(text.strip()) < 2: return []
        
        sentences = [s.strip() for s in re.split(r'[。！\n]', text) if len(s.strip()) > 2]
        try:
            doc = self.pipeline(sentences)
        except Exception as e:
            print(f"推理异常: {e}")
            return []

        results = {}
        # 安全获取各个任务的输出列表
        all_tok = doc.get('tok/fine', doc.get('tok', []))
        all_srl = doc.get('srl', [[]] * len(sentences))
        all_dep = doc.get('dep', [[]] * len(sentences))

        # 使用 zip 同时遍历每一句的各种属性
        for i, (tokens, srl_data, dep_data) in enumerate(zip(all_tok, all_srl, all_dep)):
            current_sent_text = sentences[i]
            triples = []

            # --- 1. SRL 提取 ---
            if srl_data:
                for pred in srl_data:
                    try:
                        if isinstance(pred, dict):
                            v = pred.get('predicate')
                            args = {arg[0]: arg[1] for arg in pred.get('arguments', []) if len(arg) >= 2}
                        elif isinstance(pred, list) and len(pred) >= 2:
                            v = pred[0]
                            args = {arg[0]: arg[1] for arg in pred[1] if isinstance(arg, list) and len(arg) >= 2}
                        else: continue

                        s, o = args.get('ARG0', ''), args.get('ARG1', '')
                        if v and (s or o):
                            triples.append((s if s else v, v if s else "涉及", o if o else v))
                    except: continue

            # --- 2. DEP 提取 ---
            if dep_data:
                for idx, (gov, rel) in enumerate(dep_data):
                    if rel in ['obj', 'nmod', 'root'] and gov > 0:
                        triples.append((tokens[gov-1], rel, tokens[idx]))

            # --- 3. 兜底策略 ---
            if not triples:
                cores = [w for w in tokens if self._is_valid_entity(w) and (w in self.domain_dict)]
                for j in range(len(cores)-1):
                    triples.append((cores[j], "关联", cores[j+1]))

            # 规范化与清洗 (保持不变...)
            for h, r, t in triples:
                norm_h, norm_t = self._normalize(h), self._normalize(t)
                if self._is_valid_entity(norm_h) and self._is_valid_entity(norm_t) and norm_h != norm_t:
                    rel = self._refine_relation(norm_h, r, norm_t, current_sent_text)
                    if rel:
                        key = f"{norm_h}-{rel}-{norm_t}"
                        results[key] = {
                            "head": {"name": norm_h, "label": self._classify(norm_h)},
                            "relation": rel,
                            "tail": {"name": norm_t, "label": self._classify(norm_t)},
                            "metadata": {"source": current_sent_text}
                        }
        
        return list(results.values())

    def _classify(self, name):
        mapping = {"Library": ["Matplotlib", "Seaborn"], "ChartType": ["图"], "Component": ["对象", "轴"], "ErrorStatus": ["异常", "报错"]}
        for label, keywords in mapping.items():
            if any(k in name for k in keywords): return label
        return "Method" if any(k in name for k in ["plt.", "sns.", "df."]) else "KnowledgePoint"

    def _normalize(self, name):
        name = re.sub(r'(库|函数|方法|类)$', '', name.lower()).strip()
        return self.alias_map.get(name, name)

    def _refine_relation(self, h, r, t, sent_text):
        # 确保至少一个是核心领域词
        if not (h in self.domain_dict or t in self.domain_dict): return None
        # 优先匹配预定义的动作映射
        for action, rel_name in ACTION_REL_MAP.items():
            if action in sent_text: return rel_name
        return "KNOWLEDGE_LINK" if (h in self.domain_dict and t in self.domain_dict) else "ASSOCIATED_WITH"

    def _is_valid_entity(self, name):
        return len(name) >= 2 and not any(c.isdigit() for c in name) and name not in {"绘制", "设置", "调用", "使用"}