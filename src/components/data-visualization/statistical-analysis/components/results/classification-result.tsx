"use client";

interface ClassificationResultProps {
	results: any;
}

export function ClassificationResult({ results }: ClassificationResultProps) {
	return (
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
	);
}