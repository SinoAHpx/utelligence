import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { CHART_TYPES, ChartType } from "@/types/chart-types";
import ColumnSelector from "./column-selector";
import AxisSelector from "./axis-selector";
import ChartTypeSelector from "./chart-type-selector";

interface AddChartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableColumns: string[];
    onCheckColumnsVisualizable: () => void;
}

/**
 * 添加图表对话框组件
 * 允许用户配置和添加新的可视化图表
 */
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
    const [maxColumns, setMaxColumns] = useState<number>(2);

    // 当图表类型改变时，更新最大列数
    useEffect(() => {
        const chartTypeDef = CHART_TYPES.find(type => type.id === selectedChartType);
        if (chartTypeDef) {
            setMaxColumns(chartTypeDef.requiresColumns);

            // 如果已选择的列超过了当前图表类型允许的列数，则裁剪选择
            if (selectedColumnsForChart.length > chartTypeDef.requiresColumns) {
                setSelectedColumnsForChart(
                    selectedColumnsForChart.slice(0, chartTypeDef.requiresColumns)
                );
            }
        }
    }, [selectedChartType, selectedColumnsForChart, setSelectedColumnsForChart]);

    // 处理打开对话框
    useEffect(() => {
        if (open) {
            resetForm();
            onCheckColumnsVisualizable();
        }
    }, [open, onCheckColumnsVisualizable]);

    /**
     * 处理列选择
     * 添加或移除选中的数据列
     */
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
            const chartTypeDef = CHART_TYPES.find(type => type.id === selectedChartType);
            const requiredColumns = chartTypeDef?.requiresColumns || 2;

            // 如果已选择的列达到了最大数量，则不再添加
            if (selectedColumnsForChart.length >= requiredColumns) {
                return;
            }

            // 添加列
            setSelectedColumnsForChart([...selectedColumnsForChart, column]);
        }

        // 清除任何验证错误
        setValidationError("");
    };

    /**
     * 验证表单数据
     * 检查图表配置的有效性
     */
    const validateForm = (): boolean => {
        // 验证图表类型
        if (selectedChartType === "") {
            setValidationError("请选择图表类型");
            return false;
        }

        // 验证选择的列
        if (selectedColumnsForChart.length === 0) {
            setValidationError("请选择至少一列数据");
            return false;
        }

        // 获取图表类型定义
        const chartTypeDef = CHART_TYPES.find(type => type.id === selectedChartType);
        if (!chartTypeDef) {
            setValidationError("未知的图表类型");
            return false;
        }

        // 验证列数
        if (selectedColumnsForChart.length < chartTypeDef.requiresColumns) {
            setValidationError(
                `${chartTypeDef.name}需要选择${chartTypeDef.requiresColumns}列数据`
            );
            return false;
        }

        // 验证坐标轴
        if (chartTypeDef.requiresAxis && selectedColumnsForChart.length >= 2 && (!xAxisColumn || !yAxisColumn)) {
            setValidationError("此类型图表需要指定X轴和Y轴");
            return false;
        }

        // 验证可视化状态（散点图可以不受此限制）
        if (selectedChartType !== "scatter") {
            for (const column of selectedColumnsForChart) {
                const statusItem = columnsVisualizableStatus.find(status => status.column === column);
                if (statusItem && !statusItem.isVisualizable) {
                    setValidationError(
                        `列 "${column}" 不适合可视化。${statusItem.reason}`
                    );
                    return false;
                }
            }
        }

        return true;
    };

    /**
     * 处理添加图表
     * 验证数据并创建新图表
     */
    const handleAddChart = () => {
        if (!validateForm()) {
            return;
        }

        // 所有验证通过，添加图表
        const newChart = {
            id: `chart-${Math.random().toString(36).substr(2, 9)}`,
            columns: selectedColumnsForChart,
            chartType: selectedChartType,
            title: chartTitle || `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} 图表`,
            xAxisColumn,
            yAxisColumn,
            duplicateValueHandling,
        };

        addChart(newChart);
        onOpenChange(false);
        resetForm();
    };

    /**
     * 重置表单
     * 清除所有输入和选择
     */
    const resetForm = () => {
        setSelectedColumnsForChart([]);
        setSelectedChartType("bar");
        setChartTitle("");
        setXAxisColumn("");
        setYAxisColumn("");
        setValidationError("");
        setDuplicateValueHandling("merge");
    };

    // 获取当前选择的图表类型定义
    const currentChartType = CHART_TYPES.find(type => type.id === selectedChartType);
    const requiresAxis = currentChartType?.requiresAxis || false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>添加可视化图表</DialogTitle>

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
                            <Label>选择数据列 {selectedColumnsForChart.length > 0 && `(已选择 ${selectedColumnsForChart.length}/${maxColumns})`}</Label>
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
                            maxColumns={maxColumns}
                            columnsVisualizableStatus={columnsVisualizableStatus}
                        />

                        {validationError && (
                            <p className="text-red-500 text-xs flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {validationError}
                            </p>
                        )}
                    </div>

                    {/* X轴和Y轴选择器（仅在选择了两列或以上且需要坐标轴时显示） */}
                    {selectedColumnsForChart.length >= 2 && requiresAxis && (
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