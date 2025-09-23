export const mockResults = {
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

export function getMockResult(algorithmId: string, availableColumns: string[]) {
	const result = mockResults[algorithmId as keyof typeof mockResults] || {
		type: "generic",
		status: "completed",
		message: `${algorithmId} 算法执行完成`,
		execution_time: "2.34s",
		parameters_used: {
			algorithm: algorithmId,
			data_points: availableColumns.length,
		},
	};

	return result;
}