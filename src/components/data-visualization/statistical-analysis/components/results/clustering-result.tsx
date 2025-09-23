"use client";

interface ClusteringResultProps {
	results: any;
}

export function ClusteringResult({ results }: ClusteringResultProps) {
	return (
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
	);
}