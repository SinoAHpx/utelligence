"use client";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/shadcn/select";

interface RegressionControlsProps {
	regressionType: string;
	setRegressionType: (value: string) => void;
	numericColumns: string[];
	dependentVar: string;
	setDependentVar: (value: string) => void;
	independentVar: string;
	setIndependentVar: (value: string) => void;
	additionalVars: string[];
	handleAddVariable: (variable: string) => void;
	handleRemoveVariable: (variable: string) => void;
}

export function RegressionControls({
	regressionType,
	setRegressionType,
	numericColumns,
	dependentVar,
	setDependentVar,
	independentVar,
	setIndependentVar,
	additionalVars,
	handleAddVariable,
	handleRemoveVariable,
}: RegressionControlsProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Regression Type Selection */}
				<div className="space-y-2 flex-1">
					<label className="text-sm font-medium">回归类型</label>
					<Select value={regressionType} onValueChange={setRegressionType}>
						<SelectTrigger>
							<SelectValue placeholder="选择回归类型" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="simple">简单线性回归</SelectItem>
							<SelectItem value="multiple">多元线性回归</SelectItem>
							<SelectItem value="logistic">逻辑回归</SelectItem>
							<SelectItem value="exponential">指数回归</SelectItem>
							<SelectItem value="power">幂函数回归</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Dependent Variable Selection */}
				<div className="space-y-2 flex-1">
					<label className="text-sm font-medium">因变量 (Y)</label>
					<Select value={dependentVar} onValueChange={setDependentVar}>
						<SelectTrigger>
							<SelectValue placeholder="选择因变量" />
						</SelectTrigger>
						<SelectContent>
							{numericColumns.map((col) => (
								<SelectItem key={col} value={col}>
									{col}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Independent Variable Selection */}
				<div className="space-y-2 flex-1">
					<label className="text-sm font-medium">主自变量 (X)</label>
					<Select value={independentVar} onValueChange={setIndependentVar}>
						<SelectTrigger>
							<SelectValue placeholder="选择主自变量" />
						</SelectTrigger>
						<SelectContent>
							{numericColumns
								.filter((col) => col !== dependentVar)
								.map((col) => (
									<SelectItem key={col} value={col}>
										{col}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Additional Variables for Multiple Regression */}
			{regressionType === "multiple" && (
				<div className="space-y-4">
					<label className="text-sm font-medium block mb-2">额外自变量 (X₂...)</label>
					<div className="flex flex-wrap gap-2 mb-2">
						{additionalVars.map((variable) => (
							<div
								key={variable}
								className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2 text-sm"
							>
								<span>{variable}</span>
								<button
									onClick={() => handleRemoveVariable(variable)}
									className="text-xs text-red-500 hover:text-red-700 font-bold"
								>
									✕
								</button>
							</div>
						))}
					</div>

					<Select onValueChange={handleAddVariable} value="">
						<SelectTrigger>
							<SelectValue placeholder="添加额外自变量..." />
						</SelectTrigger>
						<SelectContent>
							{numericColumns
								.filter(
									(col) =>
										col !== dependentVar && col !== independentVar && !additionalVars.includes(col)
								)
								.map((col) => (
									<SelectItem key={col} value={col}>
										{col}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}
