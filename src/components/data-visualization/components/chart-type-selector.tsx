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
    // 获取当前选择的图表类型定义
    const selectedChartTypeDef = CHART_TYPES.find(
        (type) => type.id === selectedChartType
    );

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

            <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                {selectedChartTypeDef ? (
                    <>
                        <h4 className="text-sm font-medium mb-1">{selectedChartTypeDef.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{selectedChartTypeDef.description}</p>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground">请选择一个图表类型</p>
                )}
            </div>
        </div>
    );
};

export default ChartTypeSelector; 