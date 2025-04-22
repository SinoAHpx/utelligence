"use client";

import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

interface RegressionTypeInformationProps {
    regressionType: string;
}

export function RegressionTypeInformation({ regressionType }: RegressionTypeInformationProps) {
    const getRegressionDescription = (type: string) => {
        switch (type) {
            case "simple": return "了解简单线性回归的适用场景和基本原理";
            case "multiple": return "了解多元线性回归的适用场景和基本原理";
            case "logistic": return "了解逻辑回归的适用场景和基本原理";
            case "exponential": return "了解指数回归的适用场景和基本原理";
            case "power": return "了解幂函数回归的适用场景和基本原理";
            default: return "选择不同的回归类型查看相关说明";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>回归分析类型说明</CardTitle>
                <CardDescription>{getRegressionDescription(regressionType)}</CardDescription>
            </CardHeader>
            <CardContent>
                {regressionType === "simple" && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">简单线性回归</h3>
                        <p>简单线性回归分析两个变量之间的线性关系，形式为 y = a + bx。它假设因变量与自变量之间存在线性关系。</p>
                        <p className="mt-2">适用场景：当您认为一个变量可以线性预测另一个变量时。</p>
                        <div className="mt-4 p-3 bg-primary/5 rounded-md">
                            <h4 className="text-sm font-semibold mb-1">数学模型</h4>
                            <p className="text-sm">y = β₀ + β₁x + ε</p>
                            <p className="text-sm mt-1">其中 β₀ 是截距，β₁ 是斜率，ε 是误差项</p>
                        </div>
                    </div>
                )}

                {regressionType === "multiple" && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">多元线性回归</h3>
                        <p>多元线性回归考虑多个自变量对因变量的影响，形式为 y = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ。</p>
                        <p className="mt-2">适用场景：当多个变量可能共同影响一个结果变量时。例如，预测房价时可能同时考虑面积、位置、年龄等多个因素。</p>
                        <div className="mt-4 p-3 bg-primary/5 rounded-md">
                            <h4 className="text-sm font-semibold mb-1">数学模型</h4>
                            <p className="text-sm">y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε</p>
                            <p className="text-sm mt-1">其中 β₀ 是截距，β₁...βₙ 是各个自变量的系数，ε 是误差项</p>
                        </div>
                    </div>
                )}

                {regressionType === "logistic" && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">逻辑回归</h3>
                        <p>逻辑回归用于预测二分类结果的概率，适用于因变量为二元（如是/否，0/1）的情况。</p>
                        <p className="mt-2">适用场景：预测事件发生的概率，如客户是否会购买产品、患者是否患有某种疾病等。</p>
                        <div className="mt-4 p-3 bg-primary/5 rounded-md">
                            <h4 className="text-sm font-semibold mb-1">数学模型</h4>
                            <p className="text-sm">logit(p) = ln(p/(1-p)) = β₀ + β₁x₁ + ... + βₙxₙ</p>
                            <p className="text-sm mt-1">p = 1/(1+e^-(β₀ + β₁x₁ + ... + βₙxₙ))</p>
                            <p className="text-sm mt-1">其中 p 是事件发生的概率，β₀ 是截距，β₁...βₙ 是各个自变量的系数</p>
                        </div>
                    </div>
                )}

                {regressionType === "exponential" && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">指数回归</h3>
                        <p>指数回归用于建模指数增长或衰减的关系，形式为 y = ae^(bx)。</p>
                        <p className="mt-2">适用场景：适用于呈指数增长的数据，如人口增长、复利增长、细菌繁殖等。</p>
                        <div className="mt-4 p-3 bg-primary/5 rounded-md">
                            <h4 className="text-sm font-semibold mb-1">数学模型</h4>
                            <p className="text-sm">y = ae^(bx) + ε</p>
                            <p className="text-sm mt-1">对数变换: ln(y) = ln(a) + bx</p>
                            <p className="text-sm mt-1">其中 a 和 b 是待估计的参数，ε 是误差项</p>
                        </div>
                    </div>
                )}

                {regressionType === "power" && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">幂函数回归</h3>
                        <p>幂函数回归用于建模符合幂函数关系的数据，形式为 y = ax^b。</p>
                        <p className="mt-2">适用场景：适用于随自变量增加呈幂次关系的数据，如物理学中的某些关系、规模效应等。</p>
                        <div className="mt-4 p-3 bg-primary/5 rounded-md">
                            <h4 className="text-sm font-semibold mb-1">数学模型</h4>
                            <p className="text-sm">y = ax^b + ε</p>
                            <p className="text-sm mt-1">对数变换: ln(y) = ln(a) + b×ln(x)</p>
                            <p className="text-sm mt-1">其中 a 和 b 是待估计的参数，ε 是误差项</p>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">其他常见非线性回归类型</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-md border">
                            <h4 className="text-sm font-semibold">对数模型</h4>
                            <p className="text-sm mt-1">y = a + b·ln(x)</p>
                            <p className="text-sm text-muted-foreground mt-1">适用于增长率随时间递减的情况</p>
                        </div>
                        <div className="p-3 rounded-md border">
                            <h4 className="text-sm font-semibold">Gompertz模型</h4>
                            <p className="text-sm mt-1">y = a·e^(-b·e^(-cx))</p>
                            <p className="text-sm text-muted-foreground mt-1">适用于S形增长曲线，如市场渗透率</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 