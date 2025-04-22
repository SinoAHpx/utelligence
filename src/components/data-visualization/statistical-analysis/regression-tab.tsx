"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { processFileData } from "@/utils/data-processing";
import {
    simpleLinearRegression,
    multipleLinearRegression,
    logisticRegression,
    exponentialRegression,
    powerRegression,
    RegressionResult
} from "@/utils/statistics/regression";
import { convertToNumericArray } from "@/utils/statistics/utils";
import { CellValue } from "@/utils/statistics/types";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from "recharts";

interface RegressionTabProps {
    file: File;
    selectedColumns: string[];
}

export function RegressionTab({ file, selectedColumns }: RegressionTabProps) {
    const [regressionType, setRegressionType] = useState<string>("simple");
    const [independentVar, setIndependentVar] = useState<string>("");
    const [dependentVar, setDependentVar] = useState<string>("");
    const [additionalVars, setAdditionalVars] = useState<string[]>([]);
    const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [regressionData, setRegressionData] = useState<{ x: number; y: number; predicted?: number }[]>([]);
    const [numericColumns, setNumericColumns] = useState<string[]>([]);
    const [hasFile, setHasFile] = useState<boolean>(false);
    const [dataPointLimit, setDataPointLimit] = useState<number>(400);

    // Initialize state when file or columns change
    useEffect(() => {
        if (file) {
            setHasFile(true);
            identifyNumericColumns();
        } else {
            setHasFile(false);
        }
    }, [file, selectedColumns]);

    // Reset dependent/independent variables when numeric columns change
    useEffect(() => {
        if (numericColumns.length > 0) {
            if (numericColumns.length > 1) {
                setDependentVar(numericColumns[0]);
                setIndependentVar(numericColumns[1]);
            } else if (numericColumns.length === 1) {
                setDependentVar(numericColumns[0]);
                setIndependentVar("");
            } else {
                setDependentVar("");
                setIndependentVar("");
            }
            setAdditionalVars([]);
        }
    }, [numericColumns]);

    // Perform regression when variables or regression type changes
    useEffect(() => {
        if (dependentVar && independentVar && hasFile) {
            performRegression();
        }
    }, [dependentVar, independentVar, additionalVars, regressionType]);

    // Identify which columns contain numeric data
    const identifyNumericColumns = () => {
        if (!file) return;

        setIsLoading(true);
        setErrorMessage(null);

        processFileData(
            file,
            (data) => {
                const headers = data.headers;
                const rows = data.rows;
                const numericCols: string[] = [];

                // Check each column for numeric values
                for (const col of selectedColumns) {
                    const colIndex = headers.indexOf(col);
                    if (colIndex !== -1) {
                        const colData = rows.map(row => row[colIndex]);
                        const numericData = convertToNumericArray(colData);

                        // Consider a column numeric if it has at least 30% numeric values
                        if (numericData.length >= (colData.length * 0.3)) {
                            numericCols.push(col);
                        }
                    }
                }

                setNumericColumns(numericCols);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error processing file:", error);
                setErrorMessage(`处理文件出错: ${error}`);
                setIsLoading(false);
            }
        );
    };

    // Perform the regression analysis
    const performRegression = () => {
        if (!file || !dependentVar || !independentVar) return;

        setIsLoading(true);
        setErrorMessage(null);

        processFileData(
            file,
            (data) => {
                const headers = data.headers;
                const rows = data.rows;

                const dependentIndex = headers.indexOf(dependentVar);
                const independentIndex = headers.indexOf(independentVar);

                if (dependentIndex === -1 || independentIndex === -1) {
                    setErrorMessage("无法找到选定的列");
                    setIsLoading(false);
                    return;
                }

                const yData = rows.map(row => row[dependentIndex]);
                const xData = rows.map(row => row[independentIndex]);

                let result: RegressionResult | null = null;

                // Perform different regression types
                switch (regressionType) {
                    case "simple":
                        result = simpleLinearRegression(xData, yData);
                        break;
                    case "multiple":
                        if (additionalVars.length > 0) {
                            const additionalData = additionalVars.map(col => {
                                const colIndex = headers.indexOf(col);
                                return colIndex !== -1 ? rows.map(row => row[colIndex]) : [];
                            }).filter(arr => arr.length > 0);

                            if (additionalData.length > 0) {
                                result = multipleLinearRegression(yData, [xData, ...additionalData]);
                            } else {
                                result = simpleLinearRegression(xData, yData);
                            }
                        } else {
                            result = simpleLinearRegression(xData, yData);
                        }
                        break;
                    case "logistic":
                        result = logisticRegression(xData, yData);
                        break;
                    case "exponential":
                        result = exponentialRegression(xData, yData);
                        break;
                    case "power":
                        result = powerRegression(xData, yData);
                        break;
                }

                if (result) {
                    setRegressionResult(result);

                    // Prepare data for visualization
                    const visualData: { x: number; y: number; predicted?: number }[] = [];
                    const numericX = convertToNumericArray(xData);
                    const numericY = convertToNumericArray(yData);

                    // Match up valid X and Y values and include predictions if available
                    for (let i = 0; i < Math.min(numericX.length, numericY.length); i++) {
                        const dataPoint: { x: number; y: number; predicted?: number } = {
                            x: numericX[i],
                            y: numericY[i]
                        };

                        if (result.predictedValues && i < result.predictedValues.length) {
                            dataPoint.predicted = result.predictedValues[i];
                        }

                        visualData.push(dataPoint);
                    }

                    // Sort data by X value for better line visualization
                    visualData.sort((a, b) => a.x - b.x);
                    setRegressionData(visualData);
                } else {
                    setErrorMessage("无法执行回归分析。请确保数据适合所选的回归类型。");
                    setRegressionResult(null);
                    setRegressionData([]);
                }

                setIsLoading(false);
            },
            (error) => {
                console.error("Error processing file:", error);
                setErrorMessage(`处理文件出错: ${error}`);
                setIsLoading(false);
            }
        );
    };

    // Truncate data points for chart rendering to improve performance
    const truncatedData = useMemo(() => {
        if (regressionData.length <= dataPointLimit) {
            return regressionData;
        }

        // If we need to truncate, use reservoir sampling to maintain distribution
        const sampledData: typeof regressionData = [];

        // Always include min and max X values to ensure we see the full range
        const sortedByX = [...regressionData].sort((a, b) => a.x - b.x);
        if (sortedByX.length > 0) {
            sampledData.push(sortedByX[0]);
            sampledData.push(sortedByX[sortedByX.length - 1]);
        }

        // Reservoir sampling for scatter points
        const remainingPoints = regressionData.filter((_, i) => i !== 0 && i !== regressionData.length - 1);
        const sampleSize = Math.min(dataPointLimit - 2, remainingPoints.length);

        for (let i = 0; i < sampleSize; i++) {
            sampledData.push(remainingPoints[i]);
        }

        for (let i = sampleSize; i < remainingPoints.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < sampleSize) {
                sampledData[j + 2] = remainingPoints[i];
            }
        }

        return sampledData;
    }, [regressionData, dataPointLimit]);

    // Get regression line points - for visualization only
    const linePoints = useMemo(() => {
        if (!regressionResult || regressionData.length === 0) {
            return [];
        }

        // Sort data by X value
        const sortedData = [...regressionData].sort((a, b) => a.x - b.x);

        // For simple linear regression or when we have predictedValues, plot the actual line
        if (regressionResult.predictedValues && regressionResult.predictedValues.length > 0) {
            // Sample points evenly to draw the line (max 100 points)
            const step = Math.max(1, Math.floor(sortedData.length / 100));
            const lineData: Array<{ x: number, y: number }> = [];

            for (let i = 0; i < sortedData.length; i += step) {
                if (sortedData[i].predicted !== undefined) {
                    lineData.push({
                        x: sortedData[i].x,
                        y: sortedData[i].predicted as number
                    });
                }
            }

            // Always include the last point
            if (lineData.length > 0 &&
                sortedData.length > 0 &&
                lineData[lineData.length - 1].x !== sortedData[sortedData.length - 1].x &&
                sortedData[sortedData.length - 1].predicted !== undefined) {
                lineData.push({
                    x: sortedData[sortedData.length - 1].x,
                    y: sortedData[sortedData.length - 1].predicted as number
                });
            }

            return lineData;
        }

        // For other regression types, generate points for the equation
        // This is needed especially for logistic, exponential and power regressions
        const xMin = sortedData[0].x;
        const xMax = sortedData[sortedData.length - 1].x;
        const step = (xMax - xMin) / 100;

        const lineData: Array<{ x: number, y: number }> = [];

        switch (regressionType) {
            case "simple":
                // y = mx + b
                if (regressionResult.slope !== undefined && regressionResult.intercept !== undefined) {
                    for (let x = xMin; x <= xMax; x += step) {
                        lineData.push({
                            x,
                            y: regressionResult.slope * x + regressionResult.intercept
                        });
                    }
                }
                break;

            case "exponential":
                // y = a * e^(bx)
                if (regressionResult.coefficients.length >= 2) {
                    const a = regressionResult.coefficients[0];
                    const b = regressionResult.coefficients[1];
                    for (let x = xMin; x <= xMax; x += step) {
                        lineData.push({
                            x,
                            y: a * Math.exp(b * x)
                        });
                    }
                }
                break;

            case "power":
                // y = a * x^b
                if (regressionResult.coefficients.length >= 2) {
                    const a = regressionResult.coefficients[0];
                    const b = regressionResult.coefficients[1];
                    for (let x = xMin; x <= xMax; x += step) {
                        // Make sure x is positive for power function
                        if (x > 0) {
                            lineData.push({
                                x,
                                y: a * Math.pow(x, b)
                            });
                        }
                    }
                }
                break;

            case "logistic":
                // y = 1 / (1 + e^(-b-mx))
                if (regressionResult.slope !== undefined && regressionResult.intercept !== undefined) {
                    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
                    for (let x = xMin; x <= xMax; x += step) {
                        lineData.push({
                            x,
                            y: sigmoid(regressionResult.intercept + regressionResult.slope * x)
                        });
                    }
                }
                break;
        }

        return lineData;
    }, [regressionResult, regressionData, regressionType]);

    // Add a variable to the multiple regression
    const handleAddVariable = (variable: string) => {
        if (!additionalVars.includes(variable) && variable !== dependentVar && variable !== independentVar) {
            setAdditionalVars([...additionalVars, variable]);
        }
    };

    // Remove a variable from the multiple regression
    const handleRemoveVariable = (variable: string) => {
        setAdditionalVars(additionalVars.filter(v => v !== variable));
    };

    if (!hasFile) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">请先上传文件</p>
            </div>
        );
    }

    if (numericColumns.length < 2) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">需要至少两列数值数据进行回归分析</p>
            </div>
        );
    }

    if (isLoading && !regressionResult) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-[300px]" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Regression controls */}
            <div className="flex flex-col md:flex-row gap-4">
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

                <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">因变量 (Y)</label>
                    <Select value={dependentVar} onValueChange={setDependentVar}>
                        <SelectTrigger>
                            <SelectValue placeholder="选择因变量" />
                        </SelectTrigger>
                        <SelectContent>
                            {numericColumns.map(col => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">自变量 (X)</label>
                    <Select value={independentVar} onValueChange={setIndependentVar}>
                        <SelectTrigger>
                            <SelectValue placeholder="选择自变量" />
                        </SelectTrigger>
                        <SelectContent>
                            {numericColumns
                                .filter(col => col !== dependentVar)
                                .map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Additional variables for multiple regression */}
            {regressionType === "multiple" && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <label className="text-sm font-medium w-full">额外自变量</label>
                        {additionalVars.map(variable => (
                            <div
                                key={variable}
                                className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-2"
                            >
                                <span>{variable}</span>
                                <button
                                    onClick={() => handleRemoveVariable(variable)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <Select onValueChange={handleAddVariable}>
                        <SelectTrigger>
                            <SelectValue placeholder="添加额外自变量" />
                        </SelectTrigger>
                        <SelectContent>
                            {numericColumns
                                .filter(col => col !== dependentVar && col !== independentVar && !additionalVars.includes(col))
                                .map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>
            )}

            {errorMessage && (
                <Alert>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Results */}
            {regressionResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visualization */}
                    <Card>
                        <CardHeader>
                            <CardTitle>回归分析可视化</CardTitle>
                            <CardDescription>
                                {dependentVar} vs {independentVar}
                                {regressionType === "multiple" && additionalVars.length > 0 && " + 其他变量"}
                                {regressionData.length > dataPointLimit && (
                                    <span className="block text-xs text-muted-foreground mt-1">
                                        (显示 {truncatedData.length} 个数据点，总共 {regressionData.length} 个)
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                        dataKey="x"
                                        name={independentVar}
                                        label={{ value: independentVar, position: 'bottom' }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="y"
                                        name={dependentVar}
                                        label={{ value: dependentVar, angle: -90, position: 'left' }}
                                    />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="观测值" data={truncatedData} fill="#8884d8" />
                                    {linePoints.length > 0 && (
                                        <Line
                                            type="monotone"
                                            data={linePoints}
                                            dataKey="y"
                                            stroke="#ff7300"
                                            name="预测值"
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    )}
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>回归模型统计</CardTitle>
                            <CardDescription>
                                {(() => {
                                    switch (regressionType) {
                                        case "simple": return "简单线性回归";
                                        case "multiple": return "多元线性回归";
                                        case "logistic": return "逻辑回归";
                                        case "exponential": return "指数回归";
                                        case "power": return "幂函数回归";
                                        default: return "回归分析";
                                    }
                                })()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="py-2 font-medium">回归方程</td>
                                        <td>{regressionResult.equation}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">
                                            {regressionType === "logistic" ? "伪R²值" : "R²值"}
                                        </td>
                                        <td>{regressionResult.r2.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">调整后的R²</td>
                                        <td>{regressionResult.adjustedR2.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">标准误差</td>
                                        <td>{regressionResult.standardError.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">观测值</td>
                                        <td>{regressionResult.observations}</td>
                                    </tr>
                                    {regressionType === "simple" && (
                                        <>
                                            <tr>
                                                <td className="py-2 font-medium">斜率</td>
                                                <td>{regressionResult.slope?.toFixed(4)}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 font-medium">截距</td>
                                                <td>{regressionResult.intercept?.toFixed(4)}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Regression Types Information */}
            <Card>
                <CardHeader>
                    <CardTitle>回归分析类型说明</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="simple">
                        <TabsList className="mb-4">
                            <TabsTrigger value="simple">简单线性回归</TabsTrigger>
                            <TabsTrigger value="multiple">多元线性回归</TabsTrigger>
                            <TabsTrigger value="logistic">逻辑回归</TabsTrigger>
                            <TabsTrigger value="nonlinear">非线性回归</TabsTrigger>
                        </TabsList>

                        <TabsContent value="simple">
                            <p>简单线性回归分析两个变量之间的线性关系，形式为 y = a + bx。它假设因变量与自变量之间存在线性关系。</p>
                            <p className="mt-2">适用场景：当您认为一个变量可以线性预测另一个变量时。</p>
                        </TabsContent>

                        <TabsContent value="multiple">
                            <p>多元线性回归考虑多个自变量对因变量的影响，形式为 y = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ。</p>
                            <p className="mt-2">适用场景：当多个变量可能共同影响一个结果变量时。</p>
                        </TabsContent>

                        <TabsContent value="logistic">
                            <p>逻辑回归用于预测二分类结果的概率，适用于因变量为二元（如是/否，0/1）的情况。</p>
                            <p className="mt-2">适用场景：预测事件发生的概率，如客户是否会购买产品、患者是否患有某种疾病等。</p>
                        </TabsContent>

                        <TabsContent value="nonlinear">
                            <p>非线性回归适用于变量之间的关系不是线性的情况。常见的非线性模型包括：</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li><b>指数模型</b>：y = ae^(bx)，适用于呈指数增长的数据，如人口增长。</li>
                                <li><b>幂函数模型</b>：y = ax^b，适用于随自变量增加呈幂次关系的数据，如物理学中的某些关系。</li>
                                <li><b>对数模型</b>：y = a + b·ln(x)，适用于增长率随时间递减的情况。</li>
                                <li><b>Gompertz模型</b>：y = a·e^(-b·e^(-cx))，适用于S形增长曲线，如市场渗透率。</li>
                            </ul>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 