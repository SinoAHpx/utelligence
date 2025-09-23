"use client";

interface DimensionalityReductionResultProps {
	results: any;
}

export function DimensionalityReductionResult({ results }: DimensionalityReductionResultProps) {
	return (
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
	);
}