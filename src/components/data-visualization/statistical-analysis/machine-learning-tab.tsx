"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/shadcn/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/shadcn/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { useState } from "react";

interface MachineLearningTabProps {
	availableColumns: string[];
	file: File | null;
}

interface Algorithm {
	id: string;
	name: string;
	description: string;
	category: string;
	parameters?: string[];
}

const algorithms: Algorithm[] = [
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

const categoryLabels = {
	unsupervised: "无监督学习",
	supervised: "监督学习",
	neural: "神经网络",
	regression: "回归分析",
	optimization: "优化算法",
	math: "数学运算",
};

const categoryColors = {
	unsupervised: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	supervised: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	neural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
	regression: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	optimization: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
	math: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function MachineLearningTab({ availableColumns, file }: MachineLearningTabProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [results, setResults] = useState<any>(null);

	const categories = Object.keys(categoryLabels);
	const filteredAlgorithms =
		selectedCategory === "all"
			? algorithms
			: algorithms.filter((alg) => alg.category === selectedCategory);

	const mockResults = {
		// Dimensionality Reduction
		pca: {
			type: "dimensionality_reduction",
			components: [
				{ component: "PC1", variance_explained: 0.65, eigenvalue: 3.2, rotation: [0.85, -0.34, 0.72, 0.45] },
				{ component: "PC2", variance_explained: 0.23, eigenvalue: 1.8, rotation: [-0.23, 0.91, -0.15, 0.62] },
				{ component: "PC3", variance_explained: 0.12, eigenvalue: 0.9, rotation: [0.31, 0.18, -0.87, 0.29] },
			],
			cumulative_variance: 0.88,
			kaiser_criterion: "PC1, PC2满足Kaiser准则 (特征值 > 1.0)",
			scree_plot_elbow: "建议保留前2个主成分",
			biplot_interpretation: "PC1主要反映数值型特征，PC2反映分类型特征的对比",
		},

		// Clustering
		kmeans: {
			type: "clustering",
			n_clusters: 3,
			inertia: 152.4,
			silhouette_score: 0.73,
			calinski_harabasz_score: 284.6,
			davies_bouldin_score: 0.65,
			cluster_centers: [
				[1.2, 3.4, 2.1, 4.8],
				[4.5, 2.8, 5.2, 1.9],
				[2.9, 6.1, 3.7, 3.4],
			],
			cluster_sizes: [28, 35, 22],
			within_cluster_sum_of_squares: [34.2, 48.7, 29.1],
			between_cluster_variance: 67.8,
			optimal_k_analysis: "肘部法则建议K=3，轮廓分析确认最优聚类数",
		},

		hclust: {
			type: "hierarchical_clustering",
			linkage_method: "Ward",
			distance_metric: "Euclidean",
			cophenetic_correlation: 0.847,
			optimal_clusters: 4,
			dendrogram_height: 12.45,
			cluster_assignments: [1, 1, 2, 3, 2, 1, 4, 2, 3, 1],
			fusion_levels: [0.85, 1.23, 2.67, 3.45, 5.12, 7.89, 9.23, 11.56, 12.45],
			interpretation: "层次结构清晰，建议在高度7.89处切分得到4个稳定聚类",
		},

		// Supervised Learning
		naive_bayes: {
			type: "classification",
			accuracy: 0.856,
			balanced_accuracy: 0.833,
			precision: [0.82, 0.91, 0.73],
			recall: [0.89, 0.78, 0.85],
			f1_score: [0.85, 0.84, 0.79],
			specificity: [0.92, 0.94, 0.88],
			confusion_matrix: [
				[45, 3, 2],
				[5, 38, 7],
				[3, 4, 43],
			],
			classes: ["Class A", "Class B", "Class C"],
			prior_probabilities: [0.35, 0.33, 0.32],
			feature_importance: {
				"特征1": 0.78,
				"特征2": 0.65,
				"特征3": 0.52,
				"特征4": 0.41,
			},
			cross_validation_score: 0.834,
			roc_auc: [0.91, 0.88, 0.85],
		},

		knn: {
			type: "knn_classification",
			k_neighbors: 5,
			accuracy: 0.892,
			distance_metric: "Minkowski (p=2)",
			precision: [0.88, 0.91, 0.87],
			recall: [0.92, 0.86, 0.89],
			f1_score: [0.90, 0.88, 0.88],
			confusion_matrix: [
				[46, 2, 1],
				[3, 43, 4],
				[2, 3, 44],
			],
			classes: ["Class A", "Class B", "Class C"],
			neighbor_distances_avg: [1.23, 1.45, 1.18],
			optimal_k_analysis: "交叉验证显示k=5时性能最佳，避免过拟合和欠拟合",
			feature_weights: "距离加权投票，近邻权重更大",
		},

		random_forest: {
			type: "ensemble_classification",
			n_estimators: 100,
			accuracy: 0.924,
			oob_score: 0.891,
			precision: [0.93, 0.92, 0.91],
			recall: [0.94, 0.90, 0.93],
			f1_score: [0.93, 0.91, 0.92],
			feature_importance: {
				"特征1": 0.342,
				"特征2": 0.256,
				"特征3": 0.198,
				"特征4": 0.147,
				"特征5": 0.057,
			},
			tree_depth_avg: 8.4,
			min_samples_split: 2,
			bootstrap_samples: true,
			cross_validation_score: 0.918,
			learning_curve_analysis: "训练集和验证集性能收敛，无明显过拟合",
		},

		decision_tree: {
			type: "tree_classification",
			accuracy: 0.878,
			max_depth: 6,
			min_samples_split: 5,
			min_samples_leaf: 2,
			feature_importance: {
				"特征1": 0.45,
				"特征2": 0.28,
				"特征3": 0.18,
				"特征4": 0.09,
			},
			tree_nodes: 23,
			leaf_nodes: 12,
			tree_depth_actual: 5,
			gini_impurity_root: 0.667,
			pruning_alpha: 0.01,
			interpretation: "根节点最优分割: 特征1 <= 2.45, 信息增益 = 0.342",
		},

		// Neural Networks
		fnn: {
			type: "neural_network",
			architecture: [8, 16, 8, 3],
			activation_function: "ReLU",
			output_activation: "Softmax",
			accuracy: 0.903,
			loss: 0.287,
			epochs: 150,
			learning_rate: 0.001,
			batch_size: 32,
			optimizer: "Adam",
			training_history: {
				train_loss: [0.856, 0.654, 0.523, 0.432, 0.365, 0.312, 0.287],
				val_loss: [0.823, 0.691, 0.567, 0.478, 0.398, 0.334, 0.295],
				train_acc: [0.623, 0.745, 0.812, 0.856, 0.884, 0.896, 0.903],
				val_acc: [0.634, 0.723, 0.798, 0.845, 0.872, 0.887, 0.901],
			},
			convergence_analysis: "损失函数平稳收敛，训练集和验证集性能接近，模型收敛良好",
		},

		som: {
			type: "self_organizing_map",
			map_size: [10, 10],
			learning_rate: 0.1,
			neighborhood_function: "Gaussian",
			training_epochs: 1000,
			quantization_error: 0.234,
			topographic_error: 0.089,
			u_matrix_analysis: "U-矩阵显示3个主要聚类区域，边界清晰",
			hit_histogram: "神经元激活分布均匀，无死神经元",
			feature_maps: {
				"特征1": "在左上角区域形成梯度分布",
				"特征2": "右下角高值区域明显",
				"特征3": "中央区域呈环形分布",
			},
			cluster_interpretation: "SOM揭示了数据的非线性拓扑结构",
		},

		// Regression
		simple_linear: {
			type: "regression",
			r_squared: 0.847,
			adjusted_r_squared: 0.832,
			coefficients: [2.34, -1.67],
			intercept: 4.21,
			p_values: [0.002, 0.015],
			std_errors: [0.45, 0.28],
			confidence_intervals: [[1.46, 3.22], [-2.22, -1.12]],
			residual_analysis: {
				durbin_watson: 1.89,
				jarque_bera_p: 0.234,
				breusch_pagan_p: 0.456,
				homoscedasticity: "残差齐次性假设成立",
				normality: "残差正态性假设成立",
			},
			prediction_intervals: "95%置信区间: [3.56, 4.86]",
		},

		polynomial: {
			type: "polynomial_regression",
			degree: 3,
			r_squared: 0.923,
			adjusted_r_squared: 0.908,
			coefficients: [1.23, -0.67, 0.34, -0.12],
			intercept: 2.87,
			aic: 156.7,
			bic: 168.4,
			cross_validation_rmse: 0.234,
			overfitting_analysis: "3次多项式在验证集上表现稳定，无明显过拟合",
			optimal_degree_selection: "基于AIC准则选择最优次数为3",
		},

		random_forest_reg: {
			type: "ensemble_regression",
			n_estimators: 100,
			r_squared: 0.912,
			mean_squared_error: 0.156,
			mean_absolute_error: 0.234,
			oob_score: 0.889,
			feature_importance: {
				"特征1": 0.384,
				"特征2": 0.267,
				"特征3": 0.189,
				"特征4": 0.123,
				"特征5": 0.037,
			},
			max_depth: 10,
			min_samples_split: 5,
			prediction_variance: 0.045,
			ensemble_diversity: "基学习器差异性良好，提升泛化能力",
		},

		// Math Operations
		svd: {
			type: "matrix_decomposition",
			singular_values: [12.34, 8.76, 5.43, 2.19, 0.87],
			rank: 5,
			condition_number: 14.2,
			frobenius_norm: 15.67,
			nuclear_norm: 29.59,
			effective_rank: 4,
			variance_explained: [0.52, 0.31, 0.12, 0.04, 0.01],
			matrix_properties: {
				full_rank: false,
				well_conditioned: true,
				numerical_stability: "良好",
			},
			applications: "可用于降维、去噪、数据压缩等任务",
		},

		evd: {
			type: "eigendecomposition",
			eigenvalues: [8.45, 6.23, 3.17, 1.89, 0.65],
			real_eigenvalues: 5,
			complex_eigenvalues: 0,
			spectral_radius: 8.45,
			trace: 20.39,
			determinant: 587.23,
			condition_number: 13.0,
			eigenvalue_distribution: "正特征值占主导，矩阵正定性良好",
			stability_analysis: "特征值分离良好，数值计算稳定",
		},

		// Optimization
		levenberg_marquardt: {
			type: "nonlinear_optimization",
			iterations: 47,
			final_cost: 0.00234,
			gradient_norm: 1.23e-6,
			parameter_changes: 2.34e-5,
			convergence: "梯度收敛",
			damping_parameter: 0.001,
			jacobian_condition: 12.4,
			optimization_path: "快速收敛，无局部最优陷阱",
			parameter_confidence: "参数估计置信区间较窄，估计精度高",
		},

		fcnnls: {
			type: "constrained_optimization",
			iterations: 89,
			final_objective: 0.00456,
			constraint_violations: 0,
			active_constraints: 12,
			kkt_conditions: "满足",
			complementarity_gap: 1.23e-8,
			primal_feasibility: 2.34e-7,
			dual_feasibility: 5.67e-8,
			optimization_status: "全局最优解",
			sparsity_pattern: "解向量具有良好的稀疏性，非零元素占23%",
		},
	};

	const runAlgorithm = async (algorithmId: string) => {
		if (!file || availableColumns.length === 0) {
			return;
		}

		setIsRunning(true);
		setResults(null);

		// Simulate processing time
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Return mock results based on algorithm
		const mockResult = mockResults[algorithmId as keyof typeof mockResults] || {
			type: "generic",
			status: "completed",
			message: `${algorithmId} 算法执行完成`,
			execution_time: "2.34s",
			parameters_used: {
				algorithm: algorithmId,
				data_points: availableColumns.length,
			},
		};

		setResults(mockResult);
		setIsRunning(false);
	};

	const renderResults = () => {
		if (!results) return null;

		return (
			<Card className="h-full">
				<CardHeader>
					<CardTitle>分析结果</CardTitle>
					<CardDescription>算法执行结果和性能指标</CardDescription>
				</CardHeader>
				<CardContent className="h-[calc(100%-80px)] overflow-auto">
					{results.type === "dimensionality_reduction" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">主成分贡献率</h4>
									<div className="space-y-2">
										{results.components.map((comp: any, index: number) => (
											<div key={index} className="space-y-1">
												<div className="flex justify-between text-sm">
													<span className="font-medium">{comp.component}</span>
													<span>{(comp.variance_explained * 100).toFixed(1)}%</span>
												</div>
												<div className="text-xs text-muted-foreground">
													特征值: {comp.eigenvalue.toFixed(2)}
												</div>
											</div>
										))}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">分析诊断</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>累计方差解释率:</span>
											<span>{(results.cumulative_variance * 100).toFixed(1)}%</span>
										</div>
									</div>
									<div className="mt-4 space-y-2">
										<div className="text-xs">
											<div className="font-medium text-blue-700 dark:text-blue-300">Kaiser准则:</div>
											<div className="text-muted-foreground">{results.kaiser_criterion}</div>
										</div>
										<div className="text-xs">
											<div className="font-medium text-green-700 dark:text-green-300">碎石图分析:</div>
											<div className="text-muted-foreground">{results.scree_plot_elbow}</div>
										</div>
										<div className="text-xs">
											<div className="font-medium text-purple-700 dark:text-purple-300">双标图解释:</div>
											<div className="text-muted-foreground">{results.biplot_interpretation}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{results.type === "hierarchical_clustering" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">层次聚类指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>连接方法:</span>
											<span>{results.linkage_method}</span>
										</div>
										<div className="flex justify-between">
											<span>距离度量:</span>
											<span>{results.distance_metric}</span>
										</div>
										<div className="flex justify-between">
											<span>共表型相关系数:</span>
											<span>{results.cophenetic_correlation.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>最优聚类数:</span>
											<span>{results.optimal_clusters}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">聚合过程</h4>
									<div className="text-xs font-mono space-y-1">
										<div className="font-medium">融合层次 (前5级):</div>
										{results.fusion_levels.slice(0, 5).map((level: number, index: number) => (
											<div key={index} className="flex justify-between">
												<span>Level {index + 1}:</span>
												<span>{level.toFixed(2)}</span>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="mt-4 p-3 bg-muted rounded-lg">
								<div className="text-xs">
									<div className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">专家解释:</div>
									<div className="text-muted-foreground">{results.interpretation}</div>
								</div>
							</div>
						</div>
					)}

					{results.type === "clustering" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">聚类指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>聚类数量:</span>
											<span>{results.n_clusters}</span>
										</div>
										<div className="flex justify-between">
											<span>轮廓系数:</span>
											<span className="text-green-600 font-medium">{results.silhouette_score.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>Calinski-Harabasz指数:</span>
											<span>{results.calinski_harabasz_score.toFixed(1)}</span>
										</div>
										<div className="flex justify-between">
											<span>Davies-Bouldin指数:</span>
											<span>{results.davies_bouldin_score.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>总内平方和:</span>
											<span>{results.inertia.toFixed(1)}</span>
										</div>
										<div className="flex justify-between">
											<span>类间方差:</span>
											<span>{results.between_cluster_variance.toFixed(1)}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">聚类分布</h4>
									<div className="space-y-3">
										{results.cluster_centers.map((center: number[], index: number) => (
											<div key={index} className="space-y-1">
												<div className="flex justify-between text-sm">
													<span className="font-medium">簇 {index + 1} ({results.cluster_sizes[index]}个样本)</span>
													<span className="text-muted-foreground">WSS: {results.within_cluster_sum_of_squares[index].toFixed(1)}</span>
												</div>
												<div className="text-xs font-mono text-muted-foreground pl-2">
													中心: [{center.map((v) => v.toFixed(2)).join(", ")}]
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="mt-4 p-3 bg-muted rounded-lg">
								<div className="text-xs">
									<div className="font-medium text-blue-700 dark:text-blue-300 mb-1">聚类诊断:</div>
									<div className="text-muted-foreground">{results.optimal_k_analysis}</div>
								</div>
							</div>
						</div>
					)}

					{(results.type === "knn_classification" || results.type === "ensemble_classification" || results.type === "tree_classification") && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">分类性能</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>准确率:</span>
											<span className="font-medium text-green-600">{(results.accuracy * 100).toFixed(1)}%</span>
										</div>
										{results.oob_score && (
											<div className="flex justify-between">
												<span>袋外评分:</span>
												<span>{(results.oob_score * 100).toFixed(1)}%</span>
											</div>
										)}
										{results.cross_validation_score && (
											<div className="flex justify-between">
												<span>交叉验证评分:</span>
												<span>{(results.cross_validation_score * 100).toFixed(1)}%</span>
											</div>
										)}
										{results.k_neighbors && (
											<div className="flex justify-between">
												<span>邻居数K:</span>
												<span>{results.k_neighbors}</span>
											</div>
										)}
										{results.n_estimators && (
											<div className="flex justify-between">
												<span>树的数量:</span>
												<span>{results.n_estimators}</span>
											</div>
										)}
										{results.max_depth && (
											<div className="flex justify-between">
												<span>最大深度:</span>
												<span>{results.max_depth}</span>
											</div>
										)}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">特征重要性</h4>
									<div className="space-y-1">
										{Object.entries(results.feature_importance || {}).map(([feature, importance]) => (
											<div key={feature} className="flex justify-between text-xs">
												<span>{feature}</span>
												<div className="flex items-center space-x-2">
													<div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-blue-500"
															style={{ width: `${(importance as number) * 100}%` }}
														/>
													</div>
													<span className="w-12 text-right">{(importance as number).toFixed(3)}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
							{results.learning_curve_analysis && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<div className="text-xs">
										<div className="font-medium text-green-700 dark:text-green-300 mb-1">学习曲线分析:</div>
										<div className="text-muted-foreground">{results.learning_curve_analysis}</div>
									</div>
								</div>
							)}
							{results.optimal_k_analysis && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<div className="text-xs">
										<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">参数优化:</div>
										<div className="text-muted-foreground">{results.optimal_k_analysis}</div>
									</div>
								</div>
							)}
							{results.interpretation && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<div className="text-xs">
										<div className="font-medium text-orange-700 dark:text-orange-300 mb-1">决策树解释:</div>
										<div className="text-muted-foreground">{results.interpretation}</div>
									</div>
								</div>
							)}
						</div>
					)}

					{results.type === "neural_network" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">网络架构</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>网络结构:</span>
											<span className="font-mono">[{results.architecture.join(" → ")}]</span>
										</div>
										<div className="flex justify-between">
											<span>激活函数:</span>
											<span>{results.activation_function}</span>
										</div>
										<div className="flex justify-between">
											<span>输出激活:</span>
											<span>{results.output_activation}</span>
										</div>
										<div className="flex justify-between">
											<span>优化器:</span>
											<span>{results.optimizer}</span>
										</div>
										<div className="flex justify-between">
											<span>学习率:</span>
											<span>{results.learning_rate}</span>
										</div>
										<div className="flex justify-between">
											<span>批量大小:</span>
											<span>{results.batch_size}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">训练结果</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>最终准确率:</span>
											<span className="font-medium text-green-600">{(results.accuracy * 100).toFixed(1)}%</span>
										</div>
										<div className="flex justify-between">
											<span>最终损失:</span>
											<span>{results.loss.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>训练轮次:</span>
											<span>{results.epochs}</span>
										</div>
									</div>
									<div className="mt-3">
										<h5 className="text-xs font-medium mb-2">训练历史 (最后7轮)</h5>
										<div className="text-xs font-mono space-y-1">
											<div className="grid grid-cols-4 gap-1 text-center font-semibold">
												<span>轮次</span>
												<span>训练损失</span>
												<span>验证损失</span>
												<span>验证精度</span>
											</div>
											{results.training_history.train_loss.map((loss: number, index: number) => (
												<div key={index} className="grid grid-cols-4 gap-1 text-center">
													<span>{(results.epochs - results.training_history.train_loss.length + index + 1)}</span>
													<span>{loss.toFixed(3)}</span>
													<span>{results.training_history.val_loss[index].toFixed(3)}</span>
													<span>{(results.training_history.val_acc[index] * 100).toFixed(1)}%</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
							<div className="mt-4 p-3 bg-muted rounded-lg">
								<div className="text-xs">
									<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">收敛性分析:</div>
									<div className="text-muted-foreground">{results.convergence_analysis}</div>
								</div>
							</div>
						</div>
					)}

					{results.type === "self_organizing_map" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">SOM参数</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>地图大小:</span>
											<span>{results.map_size[0]} × {results.map_size[1]}</span>
										</div>
										<div className="flex justify-between">
											<span>学习率:</span>
											<span>{results.learning_rate}</span>
										</div>
										<div className="flex justify-between">
											<span>邻域函数:</span>
											<span>{results.neighborhood_function}</span>
										</div>
										<div className="flex justify-between">
											<span>训练轮次:</span>
											<span>{results.training_epochs.toLocaleString()}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">质量指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>量化误差:</span>
											<span className="text-blue-600 font-medium">{results.quantization_error.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>拓扑误差:</span>
											<span className="text-green-600 font-medium">{results.topographic_error.toFixed(3)}</span>
										</div>
									</div>
								</div>
							</div>
							<div className="space-y-3 mt-4">
								<div>
									<h4 className="text-sm font-medium mb-2">特征地图分析</h4>
									<div className="space-y-2">
										{Object.entries(results.feature_maps).map(([feature, description]) => (
											<div key={feature} className="text-xs">
												<span className="font-medium text-indigo-600 dark:text-indigo-300">{feature}:</span>
												<span className="text-muted-foreground ml-2">{String(description)}</span>
											</div>
										))}
									</div>
								</div>
								<div className="space-y-2">
									<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-blue-700 dark:text-blue-300 mb-1">U-矩阵分析:</div>
											<div className="text-muted-foreground">{results.u_matrix_analysis}</div>
										</div>
									</div>
									<div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-green-700 dark:text-green-300 mb-1">神经元激活:</div>
											<div className="text-muted-foreground">{results.hit_histogram}</div>
										</div>
									</div>
									<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">拓扑结构:</div>
											<div className="text-muted-foreground">{results.cluster_interpretation}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{(results.type === "regression" || results.type === "polynomial_regression" || results.type === "ensemble_regression") && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">回归性能</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>R² 决定系数:</span>
											<span className="font-medium text-green-600">{results.r_squared.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>调整R²:</span>
											<span>{results.adjusted_r_squared.toFixed(3)}</span>
										</div>
										{results.mean_squared_error && (
											<div className="flex justify-between">
												<span>均方误差 (MSE):</span>
												<span>{results.mean_squared_error.toFixed(3)}</span>
											</div>
										)}
										{results.mean_absolute_error && (
											<div className="flex justify-between">
												<span>平均绝对误差 (MAE):</span>
												<span>{results.mean_absolute_error.toFixed(3)}</span>
											</div>
										)}
										{results.cross_validation_rmse && (
											<div className="flex justify-between">
												<span>交叉验证RMSE:</span>
												<span>{results.cross_validation_rmse.toFixed(3)}</span>
											</div>
										)}
										{results.oob_score && (
											<div className="flex justify-between">
												<span>袋外评分:</span>
												<span>{results.oob_score.toFixed(3)}</span>
											</div>
										)}
										<div className="flex justify-between">
											<span>截距:</span>
											<span>{results.intercept.toFixed(3)}</span>
										</div>
										{results.degree && (
											<div className="flex justify-between">
												<span>多项式次数:</span>
												<span>{results.degree}</span>
											</div>
										)}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">
										{results.feature_importance ? "特征重要性" : "回归系数"}
									</h4>
									{results.feature_importance ? (
										<div className="space-y-1">
											{Object.entries(results.feature_importance).map(([feature, importance]) => (
												<div key={feature} className="flex justify-between text-xs">
													<span>{feature}</span>
													<div className="flex items-center space-x-2">
														<div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
															<div
																className="h-full bg-blue-500"
																style={{ width: `${(importance as number) * 100}%` }}
															/>
														</div>
														<span className="w-12 text-right">{(importance as number).toFixed(3)}</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-xs space-y-1">
											{results.coefficients.map((coef: number, index: number) => (
												<div key={index} className="space-y-1">
													<div className="flex justify-between">
														<span className="font-medium">β{index + 1}:</span>
														<span>{coef.toFixed(3)}</span>
													</div>
													{results.p_values && (
														<div className="flex justify-between text-muted-foreground">
															<span>p-value:</span>
															<span className={results.p_values[index] < 0.05 ? "text-green-600" : "text-orange-600"}>
																{results.p_values[index].toFixed(3)}
															</span>
														</div>
													)}
													{results.confidence_intervals && (
														<div className="flex justify-between text-muted-foreground">
															<span>95% CI:</span>
															<span>[{results.confidence_intervals[index][0].toFixed(2)}, {results.confidence_intervals[index][1].toFixed(2)}]</span>
														</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							</div>
							{results.residual_analysis && (
								<div className="mt-4 space-y-3">
									<h4 className="text-sm font-medium">残差诊断</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span>Durbin-Watson统计量:</span>
												<span>{results.residual_analysis.durbin_watson.toFixed(3)}</span>
											</div>
											<div className="flex justify-between">
												<span>Jarque-Bera p值:</span>
												<span className={results.residual_analysis.jarque_bera_p > 0.05 ? "text-green-600" : "text-orange-600"}>
													{results.residual_analysis.jarque_bera_p.toFixed(3)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Breusch-Pagan p值:</span>
												<span className={results.residual_analysis.breusch_pagan_p > 0.05 ? "text-green-600" : "text-orange-600"}>
													{results.residual_analysis.breusch_pagan_p.toFixed(3)}
												</span>
											</div>
										</div>
										<div className="space-y-2">
											<div className="p-2 bg-green-50 dark:bg-green-950 rounded">
												<div className="text-xs text-green-700 dark:text-green-300 font-medium">齐次性检验:</div>
												<div className="text-xs text-muted-foreground">{results.residual_analysis.homoscedasticity}</div>
											</div>
											<div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
												<div className="text-xs text-blue-700 dark:text-blue-300 font-medium">正态性检验:</div>
												<div className="text-xs text-muted-foreground">{results.residual_analysis.normality}</div>
											</div>
										</div>
									</div>
								</div>
							)}
							{(results.aic || results.bic) && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<h4 className="text-sm font-medium mb-2">模型选择指标</h4>
									<div className="grid grid-cols-2 gap-4 text-sm">
										{results.aic && (
											<div className="flex justify-between">
												<span>AIC:</span>
												<span>{results.aic.toFixed(1)}</span>
											</div>
										)}
										{results.bic && (
											<div className="flex justify-between">
												<span>BIC:</span>
												<span>{results.bic.toFixed(1)}</span>
											</div>
										)}
									</div>
								</div>
							)}
							{(results.overfitting_analysis || results.optimal_degree_selection || results.ensemble_diversity) && (
								<div className="mt-4 space-y-2">
									{results.overfitting_analysis && (
										<div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
											<div className="text-xs">
												<div className="font-medium text-orange-700 dark:text-orange-300 mb-1">过拟合分析:</div>
												<div className="text-muted-foreground">{results.overfitting_analysis}</div>
											</div>
										</div>
									)}
									{results.optimal_degree_selection && (
										<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
											<div className="text-xs">
												<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">最优次数选择:</div>
												<div className="text-muted-foreground">{results.optimal_degree_selection}</div>
											</div>
										</div>
									)}
									{results.ensemble_diversity && (
										<div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
											<div className="text-xs">
												<div className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">集成学习分析:</div>
												<div className="text-muted-foreground">{results.ensemble_diversity}</div>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{(results.type === "matrix_decomposition" || results.type === "eigendecomposition") && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">矩阵属性</h4>
									<div className="space-y-2 text-sm">
										{results.singular_values && (
											<>
												<div className="flex justify-between">
													<span>矩阵秩:</span>
													<span>{results.rank}</span>
												</div>
												<div className="flex justify-between">
													<span>有效秩:</span>
													<span>{results.effective_rank}</span>
												</div>
												<div className="flex justify-between">
													<span>条件数:</span>
													<span className={results.condition_number < 100 ? "text-green-600" : "text-orange-600"}>
														{results.condition_number.toFixed(1)}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Frobenius范数:</span>
													<span>{results.frobenius_norm.toFixed(2)}</span>
												</div>
												<div className="flex justify-between">
													<span>核范数:</span>
													<span>{results.nuclear_norm.toFixed(2)}</span>
												</div>
											</>
										)}
										{results.eigenvalues && (
											<>
												<div className="flex justify-between">
													<span>谱半径:</span>
													<span>{results.spectral_radius.toFixed(2)}</span>
												</div>
												<div className="flex justify-between">
													<span>迹 (Trace):</span>
													<span>{results.trace.toFixed(2)}</span>
												</div>
												<div className="flex justify-between">
													<span>行列式:</span>
													<span>{results.determinant.toFixed(1)}</span>
												</div>
												<div className="flex justify-between">
													<span>条件数:</span>
													<span className={results.condition_number < 100 ? "text-green-600" : "text-orange-600"}>
														{results.condition_number.toFixed(1)}
													</span>
												</div>
											</>
										)}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">
										{results.singular_values ? "奇异值分布" : "特征值分布"}
									</h4>
									<div className="space-y-2">
										{(results.singular_values || results.eigenvalues).map((value: number, index: number) => (
											<div key={index} className="flex justify-between text-xs">
												<span className="font-medium">
													{results.singular_values ? `σ${index + 1}` : `λ${index + 1}`}
												</span>
												<div className="flex items-center space-x-2">
													<div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-blue-500"
															style={{
																width: `${(value / Math.max(...(results.singular_values || results.eigenvalues))) * 100}%`
															}}
														/>
													</div>
													<span className="w-12 text-right">{value.toFixed(2)}</span>
													{results.variance_explained && (
														<span className="text-muted-foreground">
															({(results.variance_explained[index] * 100).toFixed(1)}%)
														</span>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
							{results.matrix_properties && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<h4 className="text-sm font-medium mb-2">数值稳定性分析</h4>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex justify-between">
											<span>满秩矩阵:</span>
											<span className={results.matrix_properties.full_rank ? "text-green-600" : "text-orange-600"}>
												{results.matrix_properties.full_rank ? "是" : "否"}
											</span>
										</div>
										<div className="flex justify-between">
											<span>良条件矩阵:</span>
											<span className={results.matrix_properties.well_conditioned ? "text-green-600" : "text-orange-600"}>
												{results.matrix_properties.well_conditioned ? "是" : "否"}
											</span>
										</div>
										<div className="flex justify-between">
											<span>数值稳定性:</span>
											<span className="text-blue-600">{results.matrix_properties.numerical_stability}</span>
										</div>
									</div>
								</div>
							)}
							<div className="space-y-2">
								{results.applications && (
									<div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-green-700 dark:text-green-300 mb-1">应用建议:</div>
											<div className="text-muted-foreground">{results.applications}</div>
										</div>
									</div>
								)}
								{results.eigenvalue_distribution && (
									<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-blue-700 dark:text-blue-300 mb-1">特征值分析:</div>
											<div className="text-muted-foreground">{results.eigenvalue_distribution}</div>
										</div>
									</div>
								)}
								{results.stability_analysis && (
									<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">稳定性分析:</div>
											<div className="text-muted-foreground">{results.stability_analysis}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{(results.type === "nonlinear_optimization" || results.type === "constrained_optimization") && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">优化结果</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>迭代次数:</span>
											<span>{results.iterations}</span>
										</div>
										<div className="flex justify-between">
											<span>最终目标函数值:</span>
											<span className="font-medium text-green-600">
												{results.final_cost ? results.final_cost.toExponential(3) : results.final_objective.toExponential(3)}
											</span>
										</div>
										<div className="flex justify-between">
											<span>收敛判据:</span>
											<span className="text-blue-600">
												{results.convergence || results.optimization_status}
											</span>
										</div>
										{results.gradient_norm && (
											<div className="flex justify-between">
												<span>梯度范数:</span>
												<span>{results.gradient_norm.toExponential(2)}</span>
											</div>
										)}
										{results.parameter_changes && (
											<div className="flex justify-between">
												<span>参数变化:</span>
												<span>{results.parameter_changes.toExponential(2)}</span>
											</div>
										)}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">数值属性</h4>
									<div className="space-y-2 text-sm">
										{results.damping_parameter && (
											<div className="flex justify-between">
												<span>阻尼参数:</span>
												<span>{results.damping_parameter.toFixed(4)}</span>
											</div>
										)}
										{results.jacobian_condition && (
											<div className="flex justify-between">
												<span>雅可比条件数:</span>
												<span className={results.jacobian_condition < 100 ? "text-green-600" : "text-orange-600"}>
													{results.jacobian_condition.toFixed(1)}
												</span>
											</div>
										)}
										{results.constraint_violations !== undefined && (
											<div className="flex justify-between">
												<span>约束违反数:</span>
												<span className={results.constraint_violations === 0 ? "text-green-600" : "text-red-600"}>
													{results.constraint_violations}
												</span>
											</div>
										)}
										{results.active_constraints && (
											<div className="flex justify-between">
												<span>活跃约束数:</span>
												<span>{results.active_constraints}</span>
											</div>
										)}
										{results.kkt_conditions && (
											<div className="flex justify-between">
												<span>KKT条件:</span>
												<span className={results.kkt_conditions === "满足" ? "text-green-600" : "text-orange-600"}>
													{results.kkt_conditions}
												</span>
											</div>
										)}
									</div>
								</div>
							</div>
							{(results.primal_feasibility || results.dual_feasibility || results.complementarity_gap) && (
								<div className="mt-4 p-3 bg-muted rounded-lg">
									<h4 className="text-sm font-medium mb-2">可行性分析</h4>
									<div className="grid grid-cols-3 gap-4 text-sm">
										{results.primal_feasibility && (
											<div>
												<span className="text-muted-foreground">原问题可行性:</span>
												<div className="font-mono text-xs">{results.primal_feasibility.toExponential(2)}</div>
											</div>
										)}
										{results.dual_feasibility && (
											<div>
												<span className="text-muted-foreground">对偶问题可行性:</span>
												<div className="font-mono text-xs">{results.dual_feasibility.toExponential(2)}</div>
											</div>
										)}
										{results.complementarity_gap && (
											<div>
												<span className="text-muted-foreground">互补间隙:</span>
												<div className="font-mono text-xs">{results.complementarity_gap.toExponential(2)}</div>
											</div>
										)}
									</div>
								</div>
							)}
							<div className="space-y-2">
								{results.optimization_path && (
									<div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-green-700 dark:text-green-300 mb-1">优化路径分析:</div>
											<div className="text-muted-foreground">{results.optimization_path}</div>
										</div>
									</div>
								)}
								{results.parameter_confidence && (
									<div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-blue-700 dark:text-blue-300 mb-1">参数置信度:</div>
											<div className="text-muted-foreground">{results.parameter_confidence}</div>
										</div>
									</div>
								)}
								{results.sparsity_pattern && (
									<div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
										<div className="text-xs">
											<div className="font-medium text-purple-700 dark:text-purple-300 mb-1">稀疏性分析:</div>
											<div className="text-muted-foreground">{results.sparsity_pattern}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{results.type === "classification" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">分类指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>准确率:</span>
											<span>{(results.accuracy * 100).toFixed(1)}%</span>
										</div>
										<div className="flex justify-between">
											<span>平均精确率:</span>
											<span>
												{(
													results.precision.reduce((a: number, b: number) => a + b, 0) /
													results.precision.length *
													100
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="flex justify-between">
											<span>平均召回率:</span>
											<span>
												{(
													results.recall.reduce((a: number, b: number) => a + b, 0) /
													results.recall.length *
													100
												).toFixed(1)}
												%
											</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">混淆矩阵</h4>
									<div className="text-xs">
										<div className="grid grid-cols-4 gap-1">
											<div></div>
											{results.classes.map((cls: string, index: number) => (
												<div key={index} className="font-medium text-center">
													{cls.slice(-1)}
												</div>
											))}
											{results.confusion_matrix.map((row: number[], rowIndex: number) => (
												<>
													<div key={`label-${rowIndex}`} className="font-medium">
														{results.classes[rowIndex].slice(-1)}
													</div>
													{row.map((cell: number, colIndex: number) => (
														<div
															key={`${rowIndex}-${colIndex}`}
															className={`text-center p-1 rounded ${
																rowIndex === colIndex
																	? "bg-green-100 dark:bg-green-900"
																	: "bg-red-100 dark:bg-red-900"
															}`}
														>
															{cell}
														</div>
													))}
												</>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{results.type === "generic" && (
						<div className="space-y-4">
							<div className="text-sm">
								<div className="flex justify-between mb-2">
									<span>执行状态:</span>
									<Badge variant="outline" className="text-green-600">
										{results.status}
									</Badge>
								</div>
								<div className="flex justify-between mb-2">
									<span>执行时间:</span>
									<span>{results.execution_time}</span>
								</div>
								<div className="mt-4">
									<p className="text-muted-foreground">{results.message}</p>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (!file) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-gray-500 dark:text-gray-400">请先上传数据文件</p>
			</div>
		);
	}

	return (
		<div className="flex gap-6 h-[calc(100vh-300px)]">
			{/* Left side - Algorithm cards */}
			<div className="w-1/2 flex flex-col space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium">机器学习算法</h3>
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="选择类别" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部算法</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category} value={category}>
									{categoryLabels[category as keyof typeof categoryLabels]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="overflow-auto p-2 pr-6 flex flex-col">
					{/* <TabsList className="grid grid-cols-7 mb-4 flex-shrink-0">
						<TabsTrigger value="all">全部</TabsTrigger>
						{categories.map((category) => (
							<TabsTrigger key={category} value={category}>
								{categoryLabels[category as keyof typeof categoryLabels]}
							</TabsTrigger>
						))}
					</TabsList> */}

					<div>
						<TabsContent value="all" className="mt-0 h-full">
							<div className="grid grid-cols-1 gap-3 h-fit ">
								{algorithms.map((algorithm) => (
									<Card
										key={algorithm.id}
										className={`cursor-pointer transition-all hover:shadow-md h-24 ${
											selectedAlgorithm === algorithm.id ? "ring-2 ring-primary" : ""
										}`}
										onClick={() => setSelectedAlgorithm(algorithm.id)}
									>
										<CardContent className="p-3 h-full flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between mb-1">
													<h4 className="text-sm font-medium truncate pr-2">{algorithm.name}</h4>
													{selectedAlgorithm !== algorithm.id && (
														<Badge
															variant="secondary"
															className={`text-xs flex-shrink-0 ${
																categoryColors[algorithm.category as keyof typeof categoryColors]
															}`}
														>
															{categoryLabels[algorithm.category as keyof typeof categoryLabels]}
														</Badge>
													)}
												</div>
												<p className="text-xs text-muted-foreground line-clamp-2">{algorithm.description}</p>
											</div>
											{selectedAlgorithm === algorithm.id && (
												<Button
													size="sm"
													className="ml-3 flex-shrink-0"
													onClick={(e) => {
														e.stopPropagation();
														runAlgorithm(algorithm.id);
													}}
													disabled={isRunning}
												>
													{isRunning ? "执行中..." : "运行"}
												</Button>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>

						{categories.map((category) => (
							<TabsContent key={category} value={category} className="mt-0 h-full">
								<div className="grid grid-cols-1 gap-3 h-fit">
									{algorithms
										.filter((alg) => alg.category === category)
										.map((algorithm) => (
											<Card
												key={algorithm.id}
												className={`cursor-pointer transition-all hover:shadow-md h-24 ${
													selectedAlgorithm === algorithm.id ? "ring-2 ring-primary" : ""
												}`}
												onClick={() => setSelectedAlgorithm(algorithm.id)}
											>
												<CardContent className="p-3 h-full flex items-center justify-between">
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-medium truncate mb-1">{algorithm.name}</h4>
														<p className="text-xs text-muted-foreground line-clamp-2">
															{algorithm.description}
														</p>
													</div>
													{selectedAlgorithm === algorithm.id && (
														<Button
															size="sm"
															className="ml-3 flex-shrink-0"
															onClick={(e) => {
																e.stopPropagation();
																runAlgorithm(algorithm.id);
															}}
															disabled={isRunning}
														>
															{isRunning ? "执行中..." : "运行"}
														</Button>
													)}
												</CardContent>
											</Card>
										))}
								</div>
							</TabsContent>
						))}
					</div>
				</Tabs>
			</div>

			{/* Right side - Results */}
			<div className="w-1/2 flex flex-col">
				<h3 className="text-lg font-medium mb-4">分析结果</h3>
				<div className="flex-1 overflow-auto">
					{selectedAlgorithm ? (
						results ? (
							renderResults()
						) : (
							<Card className="h-full">
								<CardContent className="flex items-center justify-center h-full">
									<div className="text-center">
										<p className="text-muted-foreground mb-4">
											已选择: {algorithms.find(a => a.id === selectedAlgorithm)?.name}
										</p>
										<p className="text-sm text-muted-foreground">点击「运行算法」按钮开始分析</p>
									</div>
								</CardContent>
							</Card>
						)
					) : (
						<Card className="h-full">
							<CardContent className="flex items-center justify-center h-full">
								<p className="text-muted-foreground">请选择一个算法开始分析</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}