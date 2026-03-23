def get_all_corpus():
    with open("../data/processed/corpus.txt", "r", encoding="utf-8") as f:
        txt = f.read()
    return txt
