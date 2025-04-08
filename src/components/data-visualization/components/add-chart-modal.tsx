import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { CHART_TYPES } from "@/types/chart-types";
import ColumnSelector from "./column-selector";
import AxisSelector from "./axis-selector";
import ChartTypeSelector from "./chart-type-selector";

interface AddChartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableColumns: string[];
    onCheckColumnsVisualizable: () => void;
}

export const AddChartModal: React.FC<AddChartModalProps> = ({
    open,
    onOpenChange,
    availableColumns,
    onCheckColumnsVisualizable,
}) => {
    const {
        selectedChartType, setSelectedChartType,
        selectedColumnsForChart, setSelectedColumnsForChart,
        chartTitle, setChartTitle,
        xAxisColumn, setXAxisColumn,
        yAxisColumn, setYAxisColumn,
        columnsVisualizableStatus,
        addChart
    } = useDataVisualizationStore();

    const [validationError, setValidationError] = useState<string>("");
    const [duplicateValueHandling, setDuplicateValueHandling] = useState<"merge" | "keep">("merge");

    // 处理打开对话框
    React.useEffect(() => {
        if (open) {
            resetForm();
            onCheckColumnsVisualizable();
        }
    }, [open, onCheckColumnsVisualizable]);

    // 处理列选择
    const handleColumnToggle = (column: string) => {
        if (selectedColumnsForChart.includes(column)) {
            // 移除列
            setSelectedColumnsForChart(
                selectedColumnsForChart.filter(col => col !== column)
            );

            // 如果是X轴或Y轴列，也要清除
            if (xAxisColumn === column) setXAxisColumn("");
            if (yAxisColumn === column) setYAxisColumn("");
        } else {
            // 如果已选择了2列，则不再添加
            if (selectedColumnsForChart.length >= 2) {
                return;
            }

            // 添加列
            setSelectedColumnsForChart([...selectedColumnsForChart, column]);
        }

        // 清除任何验证错误
        setValidationError("");
    };

    // 处理添加图表
    const handleAddChart = () => {
        // 验证必填项
        if (selectedChartType === "") {
            setValidationError("请选择图表类型");
            return;
        }

        if (selectedColumnsForChart.length === 0) {
            setValidationError("请选择至少一列数据");
            return;
        }

        // 饼图只需要一列数据
        if (selectedChartType === "pie" && selectedColumnsForChart.length !== 1) {
            setValidationError("饼图只需要选择一列数据");
            return;
        }

        // 需要X轴和Y轴的图表
        if (
            ["bar", "line", "scatter", "area", "radar"].includes(selectedChartType) &&
            (selectedColumnsForChart.length !== 2 || !xAxisColumn || !yAxisColumn)
        ) {
            setValidationError("此类型图表需要选择两列数据，并指定X轴和Y轴");
            return;
        }

        // 验证可视化状态
        for (const column of selectedColumnsForChart) {
            const statusItem = columnsVisualizableStatus.find(status => status.column === column);
            if (
                statusItem && !statusItem.isVisualizable &&
                selectedChartType !== "scatter"
            ) {
                setValidationError(
                    `列 "${column}" 不适合可视化。${statusItem.reason}`
                );
                return;
            }
        }

        // 所有验证通过，添加图表
        const newChart = {
            id: `chart-${Math.random().toString(36).substr(2, 9)}`,
            columns: selectedColumnsForChart,
            chartType: selectedChartType,
            title: chartTitle || `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} 图表`,
            xAxisColumn: xAxisColumn,
            yAxisColumn: yAxisColumn,
            duplicateValueHandling: duplicateValueHandling,
        };

        addChart(newChart);
        onOpenChange(false);
        resetForm();
    };

    // 重置表单
    const resetForm = () => {
        setSelectedColumnsForChart([]);
        setSelectedChartType("bar");
        setChartTitle("");
        setXAxisColumn("");
        setYAxisColumn("");
        setValidationError("");
        setDuplicateValueHandling("merge");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>添加可视化图表</DialogTitle>
                    <DialogDescription>
                        选择需要可视化的数据列和图表类型（最多选择2列数据）
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="chart-title">图表标题</Label>
                        <Input
                            id="chart-title"
                            value={chartTitle}
                            onChange={(e) => setChartTitle(e.target.value)}
                            placeholder="输入图表标题（可选）"
                        />
                    </div>

                    <ChartTypeSelector
                        selectedChartType={selectedChartType}
                        onChartTypeChange={setSelectedChartType}
                    />

                    {/* 添加重复值处理选项 */}
                    <div className="space-y-2">
                        <Label>重复值处理</Label>
                        <RadioGroup
                            value={duplicateValueHandling}
                            onValueChange={(value) => setDuplicateValueHandling(value as "merge" | "keep")}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="merge" id="merge-duplicates" />
                                <Label htmlFor="merge-duplicates">合并重复值（推荐）</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="keep" id="keep-duplicates" />
                                <Label htmlFor="keep-duplicates">保留重复值</Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground">
                            {duplicateValueHandling === "merge"
                                ? "合并重复值会将相同值的数据点合并，适合展示频率分布"
                                : "保留重复值将显示原始数据中的每个值，适合展示时间序列等"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>选择数据列 {selectedColumnsForChart.length > 0 && `(已选择 ${selectedColumnsForChart.length}/2)`}</Label>
                            {columnsVisualizableStatus.some(col => !col.isVisualizable) && (
                                <div className="flex items-center text-amber-500 text-xs">
                                    <AlertCircle size={14} className="mr-1" />
                                    部分列不适合可视化
                                </div>
                            )}
                        </div>

                        <ColumnSelector
                            columns={availableColumns}
                            selectedColumns={selectedColumnsForChart}
                            onColumnToggle={handleColumnToggle}
                            maxColumns={2}
                            columnsVisualizableStatus={columnsVisualizableStatus}
                        />

                        {validationError && (
                            <p className="text-red-500 text-xs flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {validationError}
                            </p>
                        )}
                    </div>

                    {/* X轴和Y轴选择器（仅在选择了两列且不是饼图时显示） */}
                    {selectedColumnsForChart.length === 2 && selectedChartType !== "pie" && (
                        <AxisSelector
                            columns={selectedColumnsForChart}
                            xAxisColumn={xAxisColumn}
                            yAxisColumn={yAxisColumn}
                            onXAxisChange={setXAxisColumn}
                            onYAxisChange={setYAxisColumn}
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            resetForm();
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleAddChart}
                        disabled={selectedColumnsForChart.length === 0}
                    >
                        添加图表
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddChartModal; 