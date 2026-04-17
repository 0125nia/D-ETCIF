from app.core.paths import INPUT_PROCESSED_DIR


def get_all_corpus():
    with open(INPUT_PROCESSED_DIR / "corpus.txt", "r", encoding="utf-8") as f:
        txt = f.read()
    return txt


ALIAS_MAP = {
    "绘图": "图表绘制",
    "画布": "Figure对象",
    # 库名/工具类别名映射
    "plt": "Matplotlib", 
    "matplotlib库": "Matplotlib",
    "matplotlib": "Matplotlib",
    "绘图库": "Matplotlib",
    "mpl": "Matplotlib",
    "plt库": "Matplotlib",
    "pyplot": "Matplotlib.pyplot",
    "sns": "Seaborn",
    "seaborn库": "Seaborn",
    "pyecharts库": "Pyecharts",
    "echarts": "ECharts",
    "notebook": "Jupyter Notebook",
    "jupyter": "Jupyter Notebook",
    "anaconda": "Anaconda环境",
    "conda": "Conda包管理工具",
    "pip": "Pip包管理工具",
    "flask": "Flask Web框架",
    "django": "Django Web框架",
    "web框架": "Web开发框架",
    # 新增别名
    "pd": "Pandas",
    "pandas库": "Pandas",
    "numpy库": "Numpy",
    "np": "Numpy",
    "plotly": "Plotly",
    "plotly库": "Plotly",
    
    # 图表类型别名映射
    "条形图": "柱状图",
    "bar chart": "柱状图",
    "柱形图": "柱状图",
    "水平柱状图": "条形图",
    "barh图": "条形图",
    "线图": "折线图",
    "line chart": "折线图",
    "趋势图": "折线图",
    "圆饼图": "饼图",
    "pie chart": "饼图",
    "环形图": "圆环图",
    "甜甜圈图": "圆环图",
    "点图": "散点图",
    "scatter chart": "散点图",
    "bubble chart": "气泡图",
    "频数分布图": "直方图",
    "histogram": "直方图",
    "盒须图": "箱线图",
    "箱形图": "箱线图",
    "箱图": "箱线图",
    "box plot": "箱线图",
    "蜘蛛图": "雷达图",
    "星状图": "雷达图",
    "极坐标图": "雷达图",
    "heatmap": "热力图",
    "密度热图": "热力图",
    "区域图": "面积图",
    "堆积面积图": "堆叠面积图",
    "倒三角图": "漏斗图",
    "funnel chart": "漏斗图",
    "桑基能量分流图": "桑基图",
    "sankey chart": "桑基图",
    "树形图": "树状图",
    "dendrogram": "树状图",
    "直角饼图": "华夫饼图",
    "waffle chart": "华夫饼图",
    "误差线图": "误差棒图",
    "error bar chart": "误差棒图",
    "violin plot": "小提琴图",
    "contour plot": "等高线图",
    "三维柱状图": "3D柱状图",
    "3D柱形图": "3D柱状图",
    "横道图": "甘特图",
    "条状图": "甘特图",
    "年龄性别金字塔图": "人口金字塔图",
    "DNA图": "哑铃图",
    "火柴杆图": "棉棒图",
    "棒棒糖图": "棉棒图",
    "流场图": "矢量场流线图",
    # 新增图表别名
    "旭日图": "Sunburst图",
    "sunburst chart": "Sunburst图",
    "词云图": "WordCloud图",
    "平行坐标图": "Parallel Coordinates图",
    "和弦图": "Chord图",
    
    # 核心对象/组件别名映射
    "画布": "Figure对象",
    "图": "Figure对象",
    "绘图区": "Axes对象",
    "坐标系": "Axes对象",
    "子图": "Axes子图对象",
    "坐标轴": "Axis对象",
    "x轴": "X轴对象",
    "y轴": "Y轴对象",
    "轴脊": "Spine对象",
    "边框": "Spine对象",
    "刻度": "Ticker对象",
    "刻度线": "刻度线对象",
    "刻度标签": "刻度标签对象",
    "标题": "Title对象",
    "图例": "Legend对象",
    "网格": "Grid对象",
    "网格线": "Grid对象",
    "标记": "Marker对象",
    "数据点标记": "Marker对象",
    "线型": "LineStyle对象",
    "线条样式": "LineStyle对象",
    "颜色映射表": "Colormap对象",
    "色卡": "Colormap对象",
    "调色板": "Palette对象",
    "配色方案": "Palette对象",
    
    # 开发/操作相关术语别名映射
    "报错": "程序异常",
    "异常": "程序异常",
    "bug": "程序缺陷",
    "运行出错": "程序运行异常",
    "安装失败": "环境安装异常",
    "导入失败": "模块导入异常",
    "渲染": "图表渲染",
    "绘制": "图表绘制",
    "出图": "图表渲染输出",
    "保存": "图表文件保存",
    "导出": "图表文件导出",
    
    # 配置/样式相关术语别名映射
    "主题": "Theme主题",
    "主题":"Theme",
    "样式": "Style",
    "样式": "Style样式",
    "全局配置": "全局配置项",
    "系列配置": "系列配置项",
    "初始化配置": "InitOpts初始化配置项",
    "动画": "Animation动画效果",
    "交互": "图表交互效果",
    "联动": "图表联动效果"
}

DOMAIN_DICT = {
    # 1. EXP (实验/项目/实训类)
    "EXP": [
        "数据可视化实验", "综合实训", "三维绘图实验", "分布分析实验", 
        "统计图表综合项目", "Seaborn进阶实训", "Matplotlib基础实验",
        # 新增实验项
        "Pyecharts可视化实训", "Plotly交互式绘图实验", "多库对比可视化项目",
        "动态图表开发实训", "大数据可视化综合实验", "图表样式定制化实训"
    ],

    # 2. TASK (任务/操作/函数类)
    "TASK": [
        # 函数调用
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
        # 新增函数
        "plt.savefig", "plt.clf", "plt.close", "sns.set_style", "sns.set_palette",
        "pd.plotting.scatter_matrix", "plotly.express.bar", "plotly.express.line",
        "pyecharts.render", "pyecharts.add", "pyecharts.set_global_opts",
        # 具体操作
        "数据适配", "数据预处理", "数据映射", "样式调整", "布局设置", "保存图表",
        "自定义布局", "并行多图", "顺序多图", "选项卡多图", "时间轮播多图",
        # 新增操作
        "动态交互配置", "图表主题切换", "颜色映射调整", "图例定制", "刻度格式化",
        "多子图联动", "图表导出为HTML", "批量绘图", "异常值标注", "数据归一化"
    ],

    # 3. KP (知识点/概念/库名)
    "KP": [
        # 工具库
        "Matplotlib", "pyecharts", "Seaborn", "Echarts", "basemap", 
        "mplot3d", "pywaffle", "numpy", "pandas",
        # 新增工具库
        "Plotly", "Pandas", "Numpy", "WordCloud", "Bokeh",
        # 图表类型概念
        "柱状图", "折线图", "饼图", "散点图", "箱线图", "热力图", "条形图", 
        "堆积柱形图", "堆积条形图", "直方图", "圆环图", "气泡图", "雷达图", 
        "误差棒图", "等高线图", "矢量场流线图", "棉棒图", "哑铃图", "甘特图", 
        "人口金字塔图", "漏斗图", "桑基图", "树状图", "华夫饼图", "3D柱形图", 
        "3D线框图", "3D曲面图", "3D散点图", "堆积面积图", "小提琴图", "点图", 
        "计数图", "回归线图", "残差图", "六边形图",
        # 新增图表类型
        "Sunburst图", "旭日图", "词云图", "平行坐标图", "和弦图", "瀑布图", "仪表盘图",
        # 核心元素概念
        "画布", "坐标轴", "子图", "轴脊", "刻度", "刻度线", "刻度标签", 
        "图例", "网格", "标题", "参考线", "参考区域", "注释文本", "表格", 
        "绘图区域", "坐标系", "极坐标系", "三维坐标系", "轴标签", "主刻度", 
        "次刻度", "视觉映射组件", "提示框组件", "数据区域缩放组件", "时间线", 
        "主题", "配色", "调色板", "布局", "约束布局", "紧密布局",
        # 新增核心元素
        "交互组件", "动态更新", "悬停提示", "数据筛选", "图表联动", "响应式布局",
        # 数据统计学概念
        "数据类型", "数据集", "长数据集", "宽数据集", "全局配置项", 
        "系列配置项", "初始化配置项", "刻度定位器", "刻度格式器", "颜色映射", 
        "核密度估计", "回归分析", "置信区间", "数据堆叠", "数据分组", 
        "数据聚合", "异常值", "四分位数", "中位数", "均值", "误差范围", 
        "数据流量", "数据分布", "数据拟合",
        # 新增统计学概念
        "数据归一化", "标准化", "分位数", "方差", "标准差", "相关性分析", "聚类分析"
    ]
}


STOP_WORDS = set([
    "工具","工具包","如果", "导致","并非","结构", "学生", "利用", "必须", "基础", "应当", "涉及", "进行", "可以", "但是", "需要", "通过", "使用", "在", "对于", "关于", "给", "为", "替",
    # 代词
    "我", "我们", "咱们", "你", "你们", "您", "他", "他们", "她", "她们", "它", "它们", "大家",
    "这", "那", "这个", "那个", "这些", "那些", "这儿", "那儿", "这里", "那里",
    "谁", "什么", "哪", "哪里", "怎么", "怎样", "为什么",
    "我的", "你的", "他的", "她的", "它的", "我们的", "你们的", "他们的",
    # 连词
    "和", "与", "及", "同", "跟", "以及", "或者", "还是", "要么", "既", "又", "一边",
    "但是", "可是", "然而", "不过", "却", "只是", "反而", "尽管", "虽然",
    "如果", "假如", "要是", "倘若", "假使", "万一", "只要", "就", "只有", "才", "无论", "都", "不管", "也",
    "因为", "所以", "因此", "因而", "由于", "导致", "致使", "使得", "既然", "之所以", "是因为",
    "而且", "并且", "甚至", "更", "还", "不但", "不仅", "不是", "就是",
    # 介词
    "在", "于", "当", "从", "自从", "到", "至", "往", "朝", "向", "里", "上", "中", "下",
    "对", "对于", "关于", "至于", "给", "为", "替",
    "用", "以", "通过", "凭借", "按照", "依照", "根据",
    "因", "为了",
    # 助词
    "的", "地", "得", "所", "似的",
    "了", "着", "过", "起来", "下去",
    "啊", "吗", "呢", "吧", "呀", "哇", "啦", "嘛", "罢了", "而已",
    # 副词
    "很", "非常", "十分", "极其", "格外", "更", "最", "太", "比较", "稍微", "有点儿",
    "都", "全", "总共", "一共", "只", "仅仅", "就", "才", "统统", "一概",
    "已经", "曾经", "刚刚", "刚才", "正在", "正", "就要", "将要", "立刻", "马上", "忽然", "突然", "渐渐", "逐渐", "终于", "始终", "一直", "永远", "从来", "总是", "偶尔", "有时",
    "又", "再", "也", "还", "屡次", "再三", "常常", "经常", "往往", "不断", "反复",
    "是", "对", "没错", "不", "没", "没有", "别", "莫", "勿", "不必", "不用", "未必",
    "难道", "岂", "究竟", "到底", "偏偏", "索性", "简直", "反正", "果然", "居然", "竟然", "幸亏", "幸好", "可惜", "遗憾",
])


ACTION_REL_MAP = {
    "绘制": "VISUALIZE_BY",
    "绘图": "VISUALIZE_BY",
    "使用": "UTILIZE",
    "调用": "CALL_METHOD",
    "设置": "SET_PROPERTIES",
    "包含": "CONTAINS",
    "属于": "INSTANCE_OF",
    "定制": "CUSTOMIZE",
    "配置": "CONFIGURE",
    # 新增关系
    "调整": "ADJUST",
    "修改": "MODIFY",
    "导出": "EXPORT",
    "保存": "SAVE",
    "导入": "IMPORT"
}