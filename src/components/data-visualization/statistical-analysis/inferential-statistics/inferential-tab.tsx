"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { InferentialFilter, InferentialCategory } from "./inferential-filter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CellValue } from "@/utils/statistics/types";
import { NormalityTests } from "./normality-tests";
import { TTests } from "./t-tests";
import { ParameterEstimation } from "./parameter-estimation";
import { ChiSquareTests } from "./chi-square-tests";

interface InferentialStatisticsTabProps {
    isLoading: boolean;
    columnData?: CellValue[];
    columnName?: string;
}

/**
 * 推断性统计标签页组件
 */
export function InferentialStatisticsTab({
    isLoading,
    columnData = [],
    columnName = "",
}: InferentialStatisticsTabProps) {
    const [category, setCategory] = useState<InferentialCategory>("all");

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    // 检查是否有足够的数据
    if (!columnData || columnData.length === 0) {
        return (
            <Alert>
                <AlertDescription>
                    暂无数据可供分析，请确保选择了有效的数据列。
                </AlertDescription>
            </Alert>
        );
    }

    // 根据选择的分类渲染相应的内容
    const renderCategoryContent = () => {
        switch (category) {
            case "parameter-estimation":
                return <ParameterEstimation data={columnData} columnName={columnName} />;
            case "normality-test":
                return <NormalityTests data={columnData} columnName={columnName} />;
            case "t-test":
                return <TTests data={columnData} columnName={columnName} />;
            case "all":
            default:
                return (
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-8">
                            <ParameterEstimation data={columnData} columnName={columnName} />
                            <NormalityTests data={columnData} columnName={columnName} />
                            <TTests data={columnData} columnName={columnName} />
                        </div>
                    </ScrollArea>
                );
        }
    };

    return (
        <div className="space-y-6">
            <InferentialFilter
                activeCategory={category}
                onCategoryChange={setCategory}
            />

            {renderCategoryContent()}
        </div>
    );
} 