import type { CellValue } from "./types";

export interface RegressionResult {
	equation: string;
	r2: number;
	adjustedR2: number;
	standardError: number;
	observations: number;
	coefficients: number[];
	slope?: number;
	intercept?: number;
	pValues?: number[];
	tValues?: number[];
	residuals?: number[];
	predictedValues?: number[];
}

/**
 * 将两列数据转换为配对的数值数组，过滤掉任一列包含非数值的行
 */
export function prepareRegressionData(
	xData: CellValue[],
	yData: CellValue[]
): [number[], number[]] {
	const pairs: [number, number][] = [];

	for (let i = 0; i < Math.min(xData.length, yData.length); i++) {
		const xValue = xData[i];
		const yValue = yData[i];

		// Convert values to numbers, checking if they are valid
		const xNum = typeof xValue === "number" ? xValue : Number(String(xValue).trim());
		const yNum = typeof yValue === "number" ? yValue : Number(String(yValue).trim());

		// Only include if both values are valid numbers
		if (
			!isNaN(xNum) &&
			!isNaN(yNum) &&
			xValue !== null &&
			xValue !== undefined &&
			String(xValue).trim() !== "" &&
			yValue !== null &&
			yValue !== undefined &&
			String(yValue).trim() !== ""
		) {
			pairs.push([xNum, yNum]);
		}
	}

	return [pairs.map((p) => p[0]), pairs.map((p) => p[1])];
}

/**
 * 将多列数据转换为回归分析所需的矩阵形式，过滤掉包含非数值的行
 */
export function prepareMultipleRegressionData(
	dependentData: CellValue[],
	independentDataArray: CellValue[][]
): [number[], number[][]] {
	const yValues: number[] = [];
	const xValuesArray: number[][] = Array(independentDataArray.length)
		.fill(0)
		.map(() => []);

	for (let i = 0; i < dependentData.length; i++) {
		const yValue = dependentData[i];
		const yNum = typeof yValue === "number" ? yValue : Number(String(yValue).trim());

		// Check if y value is valid
		if (isNaN(yNum) || yValue === null || yValue === undefined || String(yValue).trim() === "") {
			continue;
		}

		// Check if all x values at this position are valid
		let allValid = true;
		const rowXValues: number[] = [];

		for (let j = 0; j < independentDataArray.length; j++) {
			const xValue = independentDataArray[j][i];
			const xNum = typeof xValue === "number" ? xValue : Number(String(xValue).trim());

			if (isNaN(xNum) || xValue === null || xValue === undefined || String(xValue).trim() === "") {
				allValid = false;
				break;
			}

			rowXValues.push(xNum);
		}

		if (allValid) {
			yValues.push(yNum);

			// Add each X value to its respective array
			for (let j = 0; j < rowXValues.length; j++) {
				xValuesArray[j].push(rowXValues[j]);
			}
		}
	}

	return [yValues, xValuesArray];
}

/**
 * 简单线性回归分析
 */
export function simpleLinearRegression(x: CellValue[], y: CellValue[]): RegressionResult | null {
	// Prepare data and filter non-numeric values
	const [xValues, yValues] = prepareRegressionData(x, y);

	if (xValues.length < 2) {
		return null; // Not enough data for regression
	}

	// Calculate means
	const n = xValues.length;
	const meanX = xValues.reduce<number>((sum, val) => sum + val, 0) / n;
	const meanY = yValues.reduce<number>((sum, val) => sum + val, 0) / n;

	// Calculate slope and intercept
	let numerator = 0;
	let denominator = 0;

	for (let i = 0; i < n; i++) {
		numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
		denominator += Math.pow(xValues[i] - meanX, 2);
	}

	const slope = numerator / denominator;
	const intercept = meanY - slope * meanX;

	// Calculate R-squared
	const predictedValues = xValues.map((x) => slope * x + intercept);
	const residuals = yValues.map((y, i) => y - predictedValues[i]);

	const totalSumOfSquares = yValues.reduce<number>((sum, y) => sum + Math.pow(y - meanY, 2), 0);
	const residualSumOfSquares = residuals.reduce<number>(
		(sum, residual) => sum + Math.pow(residual, 2),
		0
	);
	const r2 = 1 - residualSumOfSquares / totalSumOfSquares;

	// Calculate adjusted R-squared
	const adjustedR2 = 1 - ((1 - r2) * (n - 1)) / (n - 2);

	// Calculate standard error
	const standardError = Math.sqrt(residualSumOfSquares / (n - 2));

	return {
		equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
		r2,
		adjustedR2,
		standardError,
		observations: n,
		coefficients: [intercept, slope],
		slope,
		intercept,
		residuals,
		predictedValues,
	};
}

/**
 * 多元线性回归
 */
export function multipleLinearRegression(
	y: CellValue[],
	xArrays: CellValue[][]
): RegressionResult | null {
	// Prepare data
	const [yValues, xValuesArrays] = prepareMultipleRegressionData(y, xArrays);

	if (yValues.length < xArrays.length + 1) {
		return null; // Not enough data for regression
	}

	const n = yValues.length; // Number of observations
	const p = xArrays.length; // Number of predictors (without intercept)

	// Create design matrix X (with column of 1s for intercept)
	const X: number[][] = Array(n)
		.fill(0)
		.map(() => [1]); // Initialize with intercept column

	// Add predictor columns
	for (let j = 0; j < p; j++) {
		for (let i = 0; i < n; i++) {
			X[i].push(xValuesArrays[j][i]);
		}
	}

	// Matrix operations for X'X
	const XtX: number[][] = Array(p + 1)
		.fill(0)
		.map(() => Array(p + 1).fill(0));
	for (let i = 0; i < p + 1; i++) {
		for (let j = 0; j < p + 1; j++) {
			for (let k = 0; k < n; k++) {
				XtX[i][j] += X[k][i] * X[k][j];
			}
		}
	}

	// Matrix operations for X'y
	const Xty: number[] = Array(p + 1).fill(0);
	for (let i = 0; i < p + 1; i++) {
		for (let k = 0; k < n; k++) {
			Xty[i] += X[k][i] * yValues[k];
		}
	}

	// Solve linear system to get coefficients (using Gaussian elimination)
	const coefficients = gaussianElimination(XtX, Xty);

	if (!coefficients) {
		return null; // Matrix inversion failed
	}

	// Calculate predicted values
	const predictedValues: number[] = Array(n).fill(0);
	for (let i = 0; i < n; i++) {
		predictedValues[i] = coefficients[0]; // Intercept
		for (let j = 1; j < p + 1; j++) {
			predictedValues[i] += coefficients[j] * X[i][j];
		}
	}

	// Calculate residuals
	const residuals = yValues.map((y, i) => y - predictedValues[i]);

	// Calculate R-squared
	const meanY = yValues.reduce<number>((sum, val) => sum + val, 0) / n;
	const totalSumOfSquares = yValues.reduce<number>((sum, y) => sum + Math.pow(y - meanY, 2), 0);
	const residualSumOfSquares = residuals.reduce<number>(
		(sum, residual) => sum + Math.pow(residual, 2),
		0
	);
	const r2 = 1 - residualSumOfSquares / totalSumOfSquares;

	// Calculate adjusted R-squared
	const adjustedR2 = 1 - ((1 - r2) * (n - 1)) / (n - (p + 1));

	// Calculate standard error
	const standardError = Math.sqrt(residualSumOfSquares / (n - (p + 1)));

	// Construct equation string
	let equation = `y = ${coefficients[0].toFixed(4)}`;
	for (let i = 1; i < coefficients.length; i++) {
		const sign = coefficients[i] >= 0 ? " + " : " - ";
		equation += `${sign}${Math.abs(coefficients[i]).toFixed(4)}x${i}`;
	}

	return {
		equation,
		r2,
		adjustedR2,
		standardError,
		observations: n,
		coefficients,
		residuals,
		predictedValues,
	};
}

/**
 * 逻辑回归 (简化实现，使用梯度下降)
 */
export function logisticRegression(
	x: CellValue[],
	y: CellValue[],
	iterations = 1000,
	learningRate = 0.1
): RegressionResult | null {
	// Prepare data and filter non-numeric values
	const [xValues, yValues] = prepareRegressionData(x, y);

	// Check if all y values are either 0 or 1
	const validBinary = yValues.every((val) => val === 0 || val === 1);
	if (!validBinary) {
		return null; // Y values must be binary (0 or 1) for logistic regression
	}

	if (xValues.length < 2) {
		return null; // Not enough data for regression
	}

	const n = xValues.length;

	// Initialize coefficients
	let intercept = 0;
	let slope = 0;

	// Sigmoid function
	const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

	// Gradient descent
	for (let iter = 0; iter < iterations; iter++) {
		let gradIntercept = 0;
		let gradSlope = 0;

		for (let i = 0; i < n; i++) {
			const z = intercept + slope * xValues[i];
			const prediction = sigmoid(z);
			const error = prediction - yValues[i];

			gradIntercept += error;
			gradSlope += error * xValues[i];
		}

		intercept -= (learningRate * gradIntercept) / n;
		slope -= (learningRate * gradSlope) / n;
	}

	// Predicted probabilities and classifications
	const predictedProbs = xValues.map((x) => sigmoid(intercept + slope * x));
	const predictedClass = predictedProbs.map((p) => (p >= 0.5 ? 1 : 0));

	// Calculate accuracy
	let correctCount = 0;
	for (let i = 0; i < n; i++) {
		if (predictedClass[i] === yValues[i]) {
			correctCount++;
		}
	}
	const accuracy = correctCount / n;

	// Calculate pseudo-R2 (McFadden's)
	// Null model (intercept only)
	const meanY = yValues.reduce<number>((sum, val) => sum + val, 0) / n;
	let nullLogLikelihood = 0;
	for (let i = 0; i < n; i++) {
		nullLogLikelihood += yValues[i] * Math.log(meanY) + (1 - yValues[i]) * Math.log(1 - meanY);
	}

	// Full model log-likelihood
	let fullLogLikelihood = 0;
	for (let i = 0; i < n; i++) {
		const p = predictedProbs[i];
		fullLogLikelihood += yValues[i] * Math.log(p) + (1 - yValues[i]) * Math.log(1 - p);
	}

	const pseudoR2 = 1 - fullLogLikelihood / nullLogLikelihood;

	return {
		equation: `logit(p) = ${intercept.toFixed(4)} + ${slope.toFixed(4)}x`,
		r2: pseudoR2,
		adjustedR2: pseudoR2, // Pseudo-R2 already accounts for model complexity
		standardError: Math.sqrt(((1 - accuracy) * accuracy) / n),
		observations: n,
		coefficients: [intercept, slope],
		slope,
		intercept,
	};
}

/**
 * 非线性回归 - 幂函数回归 (y = ax^b)
 * 通过日志转换为线性关系: log(y) = log(a) + b*log(x)
 */
export function powerRegression(x: CellValue[], y: CellValue[]): RegressionResult | null {
	// Filter out non-positive values which can't be log-transformed
	const validPairs: { x: number; y: number }[] = [];

	for (let i = 0; i < Math.min(x.length, y.length); i++) {
		const xRaw = x[i];
		const yRaw = y[i];

		if (xRaw === null || xRaw === undefined || yRaw === null || yRaw === undefined) {
			continue;
		}

		const xValue = typeof xRaw === "number" ? xRaw : Number(String(xRaw).trim());
		const yValue = typeof yRaw === "number" ? yRaw : Number(String(yRaw).trim());

		if (!isNaN(xValue) && !isNaN(yValue) && xValue > 0 && yValue > 0) {
			validPairs.push({ x: xValue, y: yValue });
		}
	}

	if (validPairs.length < 2) {
		return null; // Not enough valid data points
	}

	// Transform data using logarithms
	const logX = validPairs.map((p) => Math.log(p.x));
	const logY = validPairs.map((p) => Math.log(p.y));

	// Perform linear regression on transformed data
	const n = validPairs.length;
	const meanLogX = logX.reduce<number>((sum, val) => sum + val, 0) / n;
	const meanLogY = logY.reduce<number>((sum, val) => sum + val, 0) / n;

	let numerator = 0;
	let denominator = 0;

	for (let i = 0; i < n; i++) {
		numerator += (logX[i] - meanLogX) * (logY[i] - meanLogY);
		denominator += Math.pow(logX[i] - meanLogX, 2);
	}

	// Calculate coefficients of log-transformed model
	const b = numerator / denominator;
	const logA = meanLogY - b * meanLogX;
	const a = Math.exp(logA);

	// Calculate R-squared for transformed model
	const predictedLogY = logX.map((x) => logA + b * x);
	const residualsLogY = logY.map((y, i) => y - predictedLogY[i]);

	const totalSumOfSquaresLog = logY.reduce<number>((sum, y) => sum + Math.pow(y - meanLogY, 2), 0);
	const residualSumOfSquaresLog = residualsLogY.reduce<number>((sum, r) => sum + Math.pow(r, 2), 0);
	const r2 = 1 - residualSumOfSquaresLog / totalSumOfSquaresLog;

	// Calculate predictions and residuals in original scale
	const xValues = validPairs.map((p) => p.x);
	const yValues = validPairs.map((p) => p.y);
	const predictedY = xValues.map((x) => a * Math.pow(x, b));
	const residuals = yValues.map((y, i) => y - predictedY[i]);

	// Calculate adjusted R-squared
	const adjustedR2 = 1 - ((1 - r2) * (n - 1)) / (n - 2);

	// Calculate standard error
	const residualSumOfSquares = residuals.reduce<number>((sum, r) => sum + Math.pow(r, 2), 0);
	const standardError = Math.sqrt(residualSumOfSquares / (n - 2));

	return {
		equation: `y = ${a.toFixed(4)} × x^${b.toFixed(4)}`,
		r2,
		adjustedR2,
		standardError,
		observations: n,
		coefficients: [a, b],
		residuals,
		predictedValues: predictedY,
	};
}

/**
 * 非线性回归 - 指数回归 (y = ae^(bx))
 * 通过日志转换为线性关系: log(y) = log(a) + bx
 */
export function exponentialRegression(x: CellValue[], y: CellValue[]): RegressionResult | null {
	// Filter out non-positive y values which can't be log-transformed
	const validPairs: { x: number; y: number }[] = [];

	for (let i = 0; i < Math.min(x.length, y.length); i++) {
		const xRaw = x[i];
		const yRaw = y[i];

		if (xRaw === null || xRaw === undefined || yRaw === null || yRaw === undefined) {
			continue;
		}

		const xValue = typeof xRaw === "number" ? xRaw : Number(String(xRaw).trim());
		const yValue = typeof yRaw === "number" ? yRaw : Number(String(yRaw).trim());

		if (!isNaN(xValue) && !isNaN(yValue) && yValue > 0) {
			validPairs.push({ x: xValue, y: yValue });
		}
	}

	if (validPairs.length < 2) {
		return null; // Not enough valid data points
	}

	const xValues = validPairs.map((p) => p.x);
	const yValues = validPairs.map((p) => p.y);
	const logY = yValues.map((y) => Math.log(y));

	// Perform linear regression on semi-log transformed data
	const n = validPairs.length;
	const meanX = xValues.reduce<number>((sum, val) => sum + val, 0) / n;
	const meanLogY = logY.reduce<number>((sum, val) => sum + val, 0) / n;

	let numerator = 0;
	let denominator = 0;

	for (let i = 0; i < n; i++) {
		numerator += (xValues[i] - meanX) * (logY[i] - meanLogY);
		denominator += Math.pow(xValues[i] - meanX, 2);
	}

	// Calculate coefficients of log-transformed model
	const b = numerator / denominator;
	const logA = meanLogY - b * meanX;
	const a = Math.exp(logA);

	// Calculate R-squared for transformed model
	const predictedLogY = xValues.map((x) => logA + b * x);
	const residualsLogY = logY.map((y, i) => y - predictedLogY[i]);

	const totalSumOfSquaresLog = logY.reduce<number>((sum, y) => sum + Math.pow(y - meanLogY, 2), 0);
	const residualSumOfSquaresLog = residualsLogY.reduce<number>((sum, r) => sum + Math.pow(r, 2), 0);
	const r2 = 1 - residualSumOfSquaresLog / totalSumOfSquaresLog;

	// Calculate predictions and residuals in original scale
	const predictedY = xValues.map((x) => a * Math.exp(b * x));
	const residuals = yValues.map((y, i) => y - predictedY[i]);

	// Calculate adjusted R-squared
	const adjustedR2 = 1 - ((1 - r2) * (n - 1)) / (n - 2);

	// Calculate standard error
	const residualSumOfSquares = residuals.reduce<number>((sum, r) => sum + Math.pow(r, 2), 0);
	const standardError = Math.sqrt(residualSumOfSquares / (n - 2));

	return {
		equation: `y = ${a.toFixed(4)} × e^(${b.toFixed(4)}x)`,
		r2,
		adjustedR2,
		standardError,
		observations: n,
		coefficients: [a, b],
		residuals,
		predictedValues: predictedY,
	};
}

/**
 * 高斯消元法求解线性方程组
 */
function gaussianElimination(A: number[][], b: number[]): number[] | null {
	const n = A.length;

	// Create augmented matrix
	const augMatrix: number[][] = [];
	for (let i = 0; i < n; i++) {
		augMatrix.push([...A[i], b[i]]);
	}

	// Gaussian elimination
	for (let i = 0; i < n; i++) {
		// Find pivot
		let maxRow = i;
		for (let j = i + 1; j < n; j++) {
			if (Math.abs(augMatrix[j][i]) > Math.abs(augMatrix[maxRow][i])) {
				maxRow = j;
			}
		}

		// Swap rows
		if (maxRow !== i) {
			[augMatrix[i], augMatrix[maxRow]] = [augMatrix[maxRow], augMatrix[i]];
		}

		// Check for singular matrix
		if (Math.abs(augMatrix[i][i]) < 1e-10) {
			return null;
		}

		// Eliminate below
		for (let j = i + 1; j < n; j++) {
			const factor = augMatrix[j][i] / augMatrix[i][i];
			for (let k = i; k <= n; k++) {
				augMatrix[j][k] -= factor * augMatrix[i][k];
			}
		}
	}

	// Back substitution
	const x: number[] = Array(n).fill(0);
	for (let i = n - 1; i >= 0; i--) {
		let sum = 0;
		for (let j = i + 1; j < n; j++) {
			sum += augMatrix[i][j] * x[j];
		}
		x[i] = (augMatrix[i][n] - sum) / augMatrix[i][i];
	}

	return x;
}
