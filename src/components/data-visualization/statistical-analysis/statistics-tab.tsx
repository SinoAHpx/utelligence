"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StatisticsFilter } from "./statistics-filter";
import { StatisticsTable } from "./statistics-table";
import { StatisticResult } from "@/utils/statistics/types";
import { formatStatValue, groupStatsByCategory } from "../utils/analysis-helpers";
import { CentralTendencyTab } from "./central-tendency-tab";
import { DispersionTab } from "./dispersion-tab";
import { DistributionTab } from "./distribution-tab";
import { CellValue } from "@/utils/statistics/types";

interface StatisticsTabProps {
    statsData: StatisticResult[];
    isLoading: boolean;
    columnData?: CellValue[];
    columnName?: string;
}

/**
 * 统计分析标签页组件
 */
export function StatisticsTab({
    statsData,
    isLoading,
    columnData = [],
    columnName = "",
}: StatisticsTabProps) {
    const [statsCategory, setStatsCategory] = useState<string>("all");

    // 按类别筛选统计数据
    const filteredStats = statsCategory === 'all'
        ? statsData
        : statsData.filter(stat => stat.category === statsCategory);

    // 按类别分组统计数据
    const statsByCategory = groupStatsByCategory(filteredStats);

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

    // 渲染特定的分析标签页
    const renderSpecificTab = () => {
        switch (statsCategory) {
            case "centralTendencyTab":
                return <CentralTendencyTab data={columnData} columnName={columnName} />;
            case "dispersionTab":
                return <DispersionTab data={columnData} columnName={columnName} />;
            case "distributionTab":
                return <DistributionTab data={columnData} columnName={columnName} />;
            default:
                return (
                    <ScrollArea className="h-[60vh]">
                        {Object.entries(statsByCategory).map(([category, stats]) => (
                            <div key={category} className="mb-8">
                                <h3 className="text-lg font-semibold mb-3 text-primary/80">{category}</h3>
                                <StatisticsTable stats={stats} formatValue={formatStatValue} />
                            </div>
                        ))}
                    </ScrollArea>
                );
        }
    };

    return (
        <div className="space-y-6">
            <StatisticsFilter
                activeCategory={statsCategory}
                onCategoryChange={setStatsCategory}
            />

            {renderSpecificTab()}
        </div>
    );
} 