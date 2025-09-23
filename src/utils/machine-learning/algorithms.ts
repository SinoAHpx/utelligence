export interface Algorithm {
	id: string;
	name: string;
	description: string;
	category: string;
	parameters?: string[];
}

export const algorithms: Algorithm[] = [
	// Unsupervised learning
	{
		id: "pca",
		name: "Principal Component Analysis (PCA)",
		description: "降维技术，用于数据可视化和特征提取",
		category: "unsupervised",
		parameters: ["components", "variance_ratio"],
	},
	{
		id: "hclust",
		name: "Hierarchical Clustering",
		description: "层次聚类算法，构建数据的树状聚类结构",
		category: "unsupervised",
		parameters: ["linkage", "distance_metric"],
	},
	{
		id: "kmeans",
		name: "K-Means Clustering",
		description: "将数据分为k个聚类的算法",
		category: "unsupervised",
		parameters: ["n_clusters", "max_iterations"],
	},

	// Supervised learning
	{
		id: "naive_bayes",
		name: "Naive Bayes",
		description: "基于贝叶斯定理的分类算法",
		category: "supervised",
		parameters: ["prior_type", "smoothing"],
	},
	{
		id: "knn",
		name: "K-Nearest Neighbor (KNN)",
		description: "基于邻近数据点的分类和回归算法",
		category: "supervised",
		parameters: ["k_neighbors", "distance_metric"],
	},
	{
		id: "pls",
		name: "Partial Least Squares (PLS)",
		description: "偏最小二乘回归和分类方法",
		category: "supervised",
		parameters: ["n_components", "algorithm"],
	},
	{
		id: "kopls",
		name: "K-OPLS",
		description: "核正交偏最小二乘方法",
		category: "supervised",
		parameters: ["kernel_type", "gamma"],
	},
	{
		id: "cross_validation",
		name: "Cross Validation",
		description: "交叉验证方法评估模型性能",
		category: "supervised",
		parameters: ["cv_folds", "scoring_metric"],
	},
	{
		id: "confusion_matrix",
		name: "Confusion Matrix",
		description: "分类模型的混淆矩阵分析",
		category: "supervised",
		parameters: ["normalize", "labels"],
	},
	{
		id: "decision_tree",
		name: "Decision Tree Classifier",
		description: "决策树分类算法",
		category: "supervised",
		parameters: ["max_depth", "min_samples_split"],
	},
	{
		id: "random_forest",
		name: "Random Forest Classifier",
		description: "随机森林分类算法",
		category: "supervised",
		parameters: ["n_estimators", "max_features"],
	},

	// Neural Networks
	{
		id: "fnn",
		name: "Feedforward Neural Networks",
		description: "前馈神经网络",
		category: "neural",
		parameters: ["hidden_layers", "activation", "learning_rate"],
	},
	{
		id: "som",
		name: "Self-Organizing Map (SOM)",
		description: "自组织映射/Kohonen网络",
		category: "neural",
		parameters: ["map_size", "learning_rate", "neighborhood"],
	},

	// Regression
	{
		id: "simple_linear",
		name: "Simple Linear Regression",
		description: "简单线性回归分析",
		category: "regression",
		parameters: ["fit_intercept"],
	},
	{
		id: "polynomial",
		name: "Polynomial Regression",
		description: "多项式回归分析",
		category: "regression",
		parameters: ["degree", "include_bias"],
	},
	{
		id: "multivariate",
		name: "Multivariate Linear Regression",
		description: "多元线性回归分析",
		category: "regression",
		parameters: ["regularization", "alpha"],
	},
	{
		id: "power",
		name: "Power Regression",
		description: "幂函数回归分析",
		category: "regression",
		parameters: ["transform_method"],
	},
	{
		id: "exponential",
		name: "Exponential Regression",
		description: "指数回归分析",
		category: "regression",
		parameters: ["base", "transform"],
	},
	{
		id: "theil_sen",
		name: "Theil-Sen Regression",
		description: "Theil-Sen稳健回归算法",
		category: "regression",
		parameters: ["max_subpopulation"],
	},
	{
		id: "robust_polynomial",
		name: "Robust Polynomial Regression",
		description: "稳健多项式回归",
		category: "regression",
		parameters: ["degree", "loss_function"],
	},
	{
		id: "decision_tree_reg",
		name: "Decision Tree Regression",
		description: "决策树回归算法",
		category: "regression",
		parameters: ["max_depth", "min_samples_leaf"],
	},
	{
		id: "random_forest_reg",
		name: "Random Forest Regression",
		description: "随机森林回归算法",
		category: "regression",
		parameters: ["n_estimators", "bootstrap"],
	},

	// Optimization
	{
		id: "levenberg_marquardt",
		name: "Levenberg-Marquardt",
		description: "Levenberg-Marquardt优化算法",
		category: "optimization",
		parameters: ["damping", "max_iterations"],
	},
	{
		id: "fcnnls",
		name: "Fast Combinatorial NNLS",
		description: "快速组合非负最小二乘法",
		category: "optimization",
		parameters: ["tolerance", "max_iterations"],
	},

	// Math
	{
		id: "svd",
		name: "Singular Value Decomposition",
		description: "奇异值分解",
		category: "math",
		parameters: ["full_matrices", "compute_uv"],
	},
	{
		id: "evd",
		name: "Eigenvalue Decomposition",
		description: "特征值分解",
		category: "math",
		parameters: ["eigvals_only"],
	},
	{
		id: "cholesky",
		name: "Cholesky Decomposition",
		description: "Cholesky分解",
		category: "math",
		parameters: ["lower", "check_finite"],
	},
	{
		id: "lu",
		name: "LU Decomposition",
		description: "LU分解",
		category: "math",
		parameters: ["permute_l", "check_finite"],
	},
	{
		id: "qr",
		name: "QR Decomposition",
		description: "QR分解",
		category: "math",
		parameters: ["mode", "pivoting"],
	},
	{
		id: "distance_matrix",
		name: "Distance Matrix",
		description: "距离矩阵计算",
		category: "math",
		parameters: ["metric", "p_norm"],
	},
];

export const categoryLabels = {
	unsupervised: "无监督学习",
	supervised: "监督学习",
	neural: "神经网络",
	regression: "回归分析",
	optimization: "优化算法",
	math: "数学运算",
};

export const categoryColors = {
	unsupervised: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	supervised: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	neural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
	regression: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	optimization: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
	math: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};