"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { ClusteringResult } from "./results/clustering-result";
import { DimensionalityReductionResult } from "./results/dimensionality-reduction-result";
import { ClassificationResult } from "./results/classification-result";

interface ResultsRendererProps {
	results: any;
	selectedAlgorithm: string;
	algorithms: Array<{ id: string; name: string }>;
}

export function ResultsRenderer({ results, selectedAlgorithm, algorithms }: ResultsRendererProps) {
	if (!results) {
		return (
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
		);
	}

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>分析结果</CardTitle>
				<CardDescription>算法执行结果和性能指标</CardDescription>
			</CardHeader>
			<CardContent className="h-[calc(100%-80px)] overflow-auto">
				{results.type === "dimensionality_reduction" && (
					<DimensionalityReductionResult results={results} />
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
					<ClusteringResult results={results} />
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

				{results.type === "classification" && (
					<ClassificationResult results={results} />
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
}