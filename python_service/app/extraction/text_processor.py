import re
import os

from app.core.paths import INPUT_RAW_DIR, INPUT_PROCESSED_DIR

def preprocess_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    # 简单的清洗：去除多余空白，按句号/换行拆分
    sentences = re.split(r'[。\n]', text)
    return [s.strip() for s in sentences if len(s.strip()) > 5]

def batch_preprocess_text(folder_path, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    
    for filename in os.listdir(folder_path):
        if filename.endswith(".txt") and not filename.startswith("~$"):
            txt_path = os.path.join(folder_path, filename)
            print(f"正在处理: {filename}")
            
            try:
                # 获取清洗后的句子列表
                sentences_list = preprocess_text(txt_path) 
                
                output_path = os.path.join(output_folder, f"{os.path.splitext(filename)[0]}.txt")
                with open(output_path, "w", encoding="utf-8") as f:
                    # 【核心修正】：用换行符将列表元素连接成字符串
                    f.write("\n".join(sentences_list)) 
                
                print(f"处理成功: {filename}")
            except Exception as e:
                print(f"处理失败 {filename}: {e}")


if __name__ == "__main__":
    batch_preprocess_text(str(INPUT_RAW_DIR), str(INPUT_PROCESSED_DIR))