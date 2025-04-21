"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export type InferentialCategory =
    | "all"
    | "parameter-estimation"
    | "normality-test"
    | "t-test"

interface InferentialFilterProps {
    activeCategory: InferentialCategory;
    onCategoryChange: (category: InferentialCategory) => void;
}

/**
 * 推断性统计分类过滤组件
 */
export function InferentialFilter({
    activeCategory,
    onCategoryChange,
}: InferentialFilterProps) {
    const categories = [
        { id: "all", name: "全部指标" },
        { id: "parameter-estimation", name: "参数估计" },
        { id: "normality-test", name: "正态性检验" },
        { id: "t-test", name: "t 检验" },
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
                <Badge
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => onCategoryChange(category.id as InferentialCategory)}
                >
                    {category.name}
                </Badge>
            ))}
        </div>
    );
} 