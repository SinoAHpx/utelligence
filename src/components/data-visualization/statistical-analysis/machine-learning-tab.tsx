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
		pca: {
			type: "dimensionality_reduction",
			components: [
				{ component: "PC1", variance_explained: 0.65, eigenvalue: 3.2 },
				{ component: "PC2", variance_explained: 0.23, eigenvalue: 1.8 },
				{ component: "PC3", variance_explained: 0.12, eigenvalue: 0.9 },
			],
			cumulative_variance: 0.88,
			loadings: [0.85, -0.34, 0.72, 0.45],
		},
		kmeans: {
			type: "clustering",
			n_clusters: 3,
			inertia: 152.4,
			silhouette_score: 0.73,
			cluster_centers: [
				[1.2, 3.4, 2.1],
				[4.5, 2.8, 5.2],
				[2.9, 6.1, 3.7],
			],
			cluster_assignments: [0, 0, 1, 2, 1, 0, 2, 1],
		},
		simple_linear: {
			type: "regression",
			r_squared: 0.847,
			adjusted_r_squared: 0.832,
			coefficients: [2.34, -1.67],
			intercept: 4.21,
			p_values: [0.002, 0.015],
			std_errors: [0.45, 0.28],
		},
		naive_bayes: {
			type: "classification",
			accuracy: 0.856,
			precision: [0.82, 0.91, 0.73],
			recall: [0.89, 0.78, 0.85],
			f1_score: [0.85, 0.84, 0.79],
			confusion_matrix: [
				[45, 3, 2],
				[5, 38, 7],
				[3, 4, 43],
			],
			classes: ["Class A", "Class B", "Class C"],
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
											<div key={index} className="flex justify-between text-sm">
												<span>{comp.component}</span>
												<span>{(comp.variance_explained * 100).toFixed(1)}%</span>
											</div>
										))}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">性能指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>累计方差解释率:</span>
											<span>{(results.cumulative_variance * 100).toFixed(1)}%</span>
										</div>
									</div>
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
											<span>{results.silhouette_score.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>惯性:</span>
											<span>{results.inertia.toFixed(1)}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">聚类中心</h4>
									<div className="text-xs font-mono">
										{results.cluster_centers.map((center: number[], index: number) => (
											<div key={index}>
												簇 {index + 1}: [{center.map((v) => v.toFixed(2)).join(", ")}]
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{results.type === "regression" && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-2">回归指标</h4>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>R²:</span>
											<span>{results.r_squared.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>调整R²:</span>
											<span>{results.adjusted_r_squared.toFixed(3)}</span>
										</div>
										<div className="flex justify-between">
											<span>截距:</span>
											<span>{results.intercept.toFixed(3)}</span>
										</div>
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-2">系数</h4>
									<div className="text-xs font-mono">
										{results.coefficients.map((coef: number, index: number) => (
											<div key={index} className="flex justify-between">
												<span>β{index + 1}:</span>
												<span>{coef.toFixed(3)} (p={results.p_values[index].toFixed(3)})</span>
											</div>
										))}
									</div>
								</div>
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
													<Badge
														variant="secondary"
														className={`text-xs flex-shrink-0 ${
															categoryColors[algorithm.category as keyof typeof categoryColors]
														}`}
													>
														{categoryLabels[algorithm.category as keyof typeof categoryLabels]}
													</Badge>
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