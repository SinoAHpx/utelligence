"use client";

import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line
} from 'recharts';
import { RegressionResult } from "@/utils/statistics/regression";

interface RegressionResultsProps {
    regressionResult: RegressionResult;
    regressionData: { x: number; y: number; predicted?: number }[];
    truncatedData: { x: number; y: number; predicted?: number }[];
    linePoints: { x: number; y: number }[];
    dependentVar: string;
    independentVar: string;
    regressionType: string;
    additionalVars: string[];
    dataPointLimit: number;
}

export function RegressionResults({
    regressionResult,
    regressionData,
    truncatedData,
    linePoints,
    dependentVar,
    independentVar,
    regressionType,
    additionalVars,
    dataPointLimit,
}: RegressionResultsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visualization Card */}
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

            {/* Statistics Card */}
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
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="py-2 font-medium">回归方程</td>
                                <td className="py-2">{regressionResult.equation}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">
                                    {regressionType === "logistic" ? "伪R²值" : "R²值"}
                                </td>
                                <td className="py-2">{regressionResult.r2.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">调整后的R²</td>
                                <td className="py-2">{regressionResult.adjustedR2.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">标准误差</td>
                                <td className="py-2">{regressionResult.standardError.toFixed(4)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium">观测值</td>
                                <td className="py-2">{regressionResult.observations}</td>
                            </tr>
                            {/* Show Slope/Intercept only for simple linear regression */}
                            {regressionType === "simple" && (
                                <>
                                    <tr>
                                        <td className="py-2 font-medium">斜率</td>
                                        <td className="py-2">{regressionResult.slope?.toFixed(4)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">截距</td>
                                        <td className="py-2">{regressionResult.intercept?.toFixed(4)}</td>
                                    </tr>
                                </>
                            )}
                            {/* Show coefficients for multiple linear regression */}
                            {regressionType === "multiple" && regressionResult.coefficients && (
                                <tr>
                                    <td className="py-2 font-medium align-top">系数</td>
                                    <td className="py-2">
                                        <ul className="list-none space-y-1">
                                            <li>截距: {regressionResult.coefficients[0]?.toFixed(4)}</li>
                                            {regressionResult.coefficients.slice(1).map((coef, index) => (
                                                <li key={index}>{`X${index + 1}`}: {coef?.toFixed(4)}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
} 