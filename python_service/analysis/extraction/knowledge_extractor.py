from transformers import pipeline
import re


class EducationalKnowledgeEngine:

    def __init__(self, model_path="./d_etcif_model"):

        self.extractor = pipeline(
            "ner",
            model=model_path,
            tokenizer=model_path,
            aggregation_strategy="simple"
        )

    def rule_extract_task(self, text):

        tasks = []

        for line in text.split("\n"):

            line = line.strip()

            if re.match(r"^\d+\.", line):

                task = re.sub(r"^\d+\.\s*", "", line)

                tasks.append(task)

        return tasks

    def extract(self, text):

        ents = self.extractor(text)

        kp_list = []
        task_list = []
        exp_list = []

        for e in ents:

            word = e["word"].replace(" ", "")

            if e["entity_group"] == "KP":
                kp_list.append(word)

            elif e["entity_group"] == "TASK":
                task_list.append(word)

            elif e["entity_group"] == "EXP":
                exp_list.append(word)

        # fallback
        if not task_list:
            task_list = self.rule_extract_task(text)

        # 如果连实验名都没有 → 再加规则
        if not exp_list:

            m = re.search(r"实验\d+", text)

            if m:
                exp_list.append(m.group())

        triplets = []

        for exp in exp_list:
            for kp in kp_list:
                triplets.append((exp, "包含知识点", kp))

        for exp in exp_list:
            for task in task_list:
                triplets.append((exp, "包含任务", task))

        return ents, triplets

# if __name__ == "__main__":
#     engine = EducationalKnowledgeEngine()
#     text = """
#     实验1：使用 matplotlib 绘制折线图
# 实验任务：
# 1. 导入 pandas
# 2. 读取 csv 数据
# 3. 使用 plot 绘图
# """

#     entities, triplets = engine.extract(text)
#     print("提取的实体:", entities)
#     print("生成的三元组:", triplets)