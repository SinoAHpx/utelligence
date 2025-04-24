"use client";

import React from "react";
import { Badge } from "@/components/ui/shadcn/badge";
import { CATEGORIES } from "@/utils/data/statistics/types";

interface StatisticsFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

/**
 * 统计分类过滤组件
 */
export function StatisticsFilter({
    activeCategory,
    onCategoryChange,
}: StatisticsFilterProps) {
    const categories = [
        { id: "all", name: "全部指标" },
        { id: CATEGORIES.CENTRAL_TENDENCY, name: "集中趋势" },
        { id: CATEGORIES.DISPERSION, name: "离散程度" },
        { id: CATEGORIES.DISTRIBUTION_SHAPE, name: "分布形态" },
        { id: CATEGORIES.BASIC, name: "基本统计" },
        { id: "centralTendencyTab", name: "中心趋势分析" },
        { id: "dispersionTab", name: "离散程度分析" },
        { id: "distributionTab", name: "分布分析" },
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
                <Badge
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => onCategoryChange(category.id)}
                >
                    {category.name}
                </Badge>
            ))}
        </div>
    );
} 