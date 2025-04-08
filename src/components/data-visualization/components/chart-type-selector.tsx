import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CHART_TYPES } from "@/types/chart-types";

interface ChartTypeSelectorProps {
    selectedChartType: string;
    onChartTypeChange: (chartType: string) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
    selectedChartType,
    onChartTypeChange,
}) => {
    return (
        <div className="space-y-2">
            <Label>选择图表类型</Label>
            <div className="flex flex-wrap gap-2">
                {CHART_TYPES.map((type) => (
                    <Button
                        key={type.id}
                        variant={selectedChartType === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChartTypeChange(type.id)}
                    >
                        {type.name}
                    </Button>
                ))}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
                {selectedChartType === "pie" ? (
                    <p>饼图只需选择一列数据，将展示各个值的占比分布</p>
                ) : (
                    <p>此类型图表需要选择两列数据，分别作为X轴和Y轴</p>
                )}
            </div>
        </div>
    );
};

export default ChartTypeSelector; 