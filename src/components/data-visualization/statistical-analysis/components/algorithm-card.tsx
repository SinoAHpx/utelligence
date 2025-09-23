"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import type { Algorithm } from "@/utils/machine-learning/algorithms";
import { categoryColors, categoryLabels } from "@/utils/machine-learning/algorithms";

interface AlgorithmCardProps {
	algorithm: Algorithm;
	isSelected: boolean;
	isRunning: boolean;
	showCategory?: boolean;
	onSelect: () => void;
	onRun: () => void;
}

export function AlgorithmCard({
	algorithm,
	isSelected,
	isRunning,
	showCategory = true,
	onSelect,
	onRun,
}: AlgorithmCardProps) {
	return (
		<Card
			className={`cursor-pointer transition-all hover:shadow-md h-24 ${
				isSelected ? "ring-2 ring-primary" : ""
			}`}
			onClick={onSelect}
		>
			<CardContent className="p-3 h-full flex items-center justify-between">
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between mb-1">
						<h4 className="text-sm font-medium truncate pr-2">{algorithm.name}</h4>
						{showCategory && !isSelected && (
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
				{isSelected && (
					<Button
						size="sm"
						className="ml-3 flex-shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							onRun();
						}}
						disabled={isRunning}
					>
						{isRunning ? "执行中..." : "运行"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}