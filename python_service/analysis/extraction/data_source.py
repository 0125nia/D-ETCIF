def get_all_corpus():
    with open("../data/processed/corpus.txt", "r", encoding="utf-8") as f:
        txt = f.read()
    return txt


ALIAS_MAP = {
            "plt": "Matplotlib",
            "matplotlib库": "Matplotlib",
            "绘图库": "Matplotlib",
            "条形图": "柱状图",
            "bar chart": "柱状图",
            "画布": "Figure对象",
            "报错": "程序异常"
        }

DOMAIN_DICT = [
    # 可视化库相关
    "Matplotlib", "pyecharts", "Seaborn", "Echarts",
    "basemap", "mplot3d", "pywaffle", "numpy", "pandas",
    # 图表类型
    "柱状图", "折线图", "饼图", "散点图", "箱线图", "热力图",
    "条形图", "堆积柱形图", "堆积条形图", "直方图", "圆环图",
    "气泡图", "雷达图", "误差棒图", "等高线图", "矢量场流线图",
    "棉棒图", "哑铃图", "甘特图", "人口金字塔图", "漏斗图",
    "桑基图", "树状图", "华夫饼图", "3D柱形图", "3D线框图",
    "3D曲面图", "3D散点图", "统计地图", "堆积面积图", "小提琴图",
    "点图", "计数图", "回归线图", "残差图", "六边形图",
    # 画布/坐标轴/图表核心元素
    "画布", "坐标轴", "子图", "轴脊", "刻度", "刻度线",
    "刻度标签", "图例", "网格", "标题", "参考线", "参考区域",
    "注释文本", "表格", "绘图区域", "坐标系", "极坐标系",
    "三维坐标系", "轴标签", "主刻度", "次刻度", "视觉映射组件",
    "提示框组件", "数据区域缩放组件", "时间线", "主题", "配色",
    "调色板", "布局", "约束布局", "紧密布局", "自定义布局",
    "并行多图", "顺序多图", "选项卡多图", "时间轮播多图",
    # 绘图函数/方法/类
    "plt.bar", "plt.plot", "plt.barh", "plt.stackplot", "plt.hist",
    "plt.pie", "plt.scatter", "plt.boxplot", "plt.polar", "plt.errorbar",
    "plt.contour", "plt.contourf", "plt.streamplot", "plt.stem", "plt.axhline",
    "plt.axvline", "plt.axhspan", "plt.axvspan", "plt.annotate", "plt.text",
    "plt.table", "plt.grid", "plt.legend", "plt.xlabel", "plt.ylabel",
    "plt.title", "plt.xlim", "plt.ylim", "plt.xticks", "plt.yticks",
    "plt.tight_layout", "plt.subplot", "plt.subplots", "plt.subplot2grid", "plt.figure",
    "sns.catplot", "sns.relplot", "sns.displot", "sns.lmplot", "sns.jointplot",
    "sns.pairplot", "sns.boxplot", "sns.barplot", "sns.lineplot", "sns.scatterplot",
    "sns.heatmap", "sns.kdeplot", "sns.stripplot", "sns.swarmplot", "sns.violinplot",
    "Bar", "Line", "Pie", "Scatter", "Map", "Funnel", "Sankey", "Grid", "Page", "Tab", "Timeline",
    # 数据处理/配置相关
    "数据适配", "数据类型", "数据集", "数据预处理", "长数据集", "宽数据集",
    "数据映射", "全局配置项", "系列配置项", "初始化配置项", "刻度定位器",
    "刻度格式器", "颜色映射", "核密度估计", "回归分析", "置信区间",
    "数据堆叠", "数据分组", "数据聚合", "异常值", "四分位数",
    "中位数", "均值", "误差范围", "数据流量", "数据分布", "数据拟合"
]
