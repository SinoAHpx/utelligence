import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, MinusCircle, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { CHART_TYPES, ChartType, ChartConfig } from "@/types/chart-types";
import { processBarChartData, processLineChartData } from "@/utils/data-processing";
import ChartTypeSelector from "./chart-type-selector";

interface AddChartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableColumns: string[];
}

/**
 * 添加图表对话框组件
 * 允许用户配置和添加新的可视化图表
 */
export const AddChartModal: React.FC<AddChartModalProps> = ({
    open,
    onOpenChange,
    availableColumns,
}) => {
    const {
        selectedChartType, setSelectedChartType,
        chartTitle, setChartTitle,
        xAxisColumn, setXAxisColumn,
        yAxisColumns, setYAxisColumns,
        columnsVisualizableStatus,
        addChart,
        rawFileData,
    } = useDataVisualizationStore();

    const [validationError, setValidationError] = useState<string>("");

    // Get current chart type definition
    const currentChartType = useMemo(() => CHART_TYPES.find((type) => type.id === selectedChartType), [selectedChartType]);
    const requiresAxis = currentChartType?.requiresAxis ?? false;
    const minRequiredYColumns = selectedChartType === 'line' ? 1 : (requiresAxis ? 1 : 0);
    const allowMultipleY = selectedChartType === 'line';

    // Filter suitable columns based on visualization status
    const visualizableColumns = useMemo(() => availableColumns.filter((col) => {
        const status = columnsVisualizableStatus.find((s) => s.column === col);
        return status?.isVisualizable ?? false;
    }), [availableColumns, columnsVisualizableStatus]);

    // Reset form when modal opens or chart type changes significantly
    useEffect(() => {
        if (open) {
            resetForm(selectedChartType);
        }
    }, [open]);

    // Reset axes when chart type changes
    useEffect(() => {
        resetAxes();
        setValidationError("");
    }, [selectedChartType]);

    // Reset form helper
    const resetForm = (chartType: string = "bar") => {
        setSelectedChartType(chartType);
        setChartTitle("");
        resetAxes();
        setValidationError("");
    };

    // Reset axes helper
    const resetAxes = () => {
        setXAxisColumn("");
        setYAxisColumns([]);
    };

    // --- Axis Selection Handlers ---

    const handleXAxisChange = (value: string) => {
        setXAxisColumn(value);
        setYAxisColumns(yAxisColumns.filter(col => col !== value));
        setValidationError("");
    };

    // Add a Y-axis
    const addYAxis = () => {
        const nextAvailable = visualizableColumns.find(
            col => col !== xAxisColumn && !yAxisColumns.includes(col)
        );
        if (nextAvailable) {
            setYAxisColumns([...yAxisColumns, nextAvailable]);
            setValidationError("");
        }
    };

    // Remove a Y-axis by index
    const removeYAxis = (indexToRemove: number) => {
        setYAxisColumns(yAxisColumns.filter((_, index) => index !== indexToRemove));
        setValidationError("");
    };

    // Change a Y-axis at a specific index
    const handleYAxisChange = (indexToChange: number, newValue: string) => {
        if (newValue === xAxisColumn || yAxisColumns.some((col, idx) => idx !== indexToChange && col === newValue)) {
            return;
        }
        const newYAxes = [...yAxisColumns];
        newYAxes[indexToChange] = newValue;
        setYAxisColumns(newYAxes);
        setValidationError("");
    };

    /**
     * 验证表单数据
     */
    const validateForm = (): boolean => {
        if (!currentChartType) {
            setValidationError("请选择有效的图表类型");
            return false;
        }

        if (requiresAxis) {
            if (!xAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择 X 轴`);
                return false;
            }
            if (yAxisColumns.length < minRequiredYColumns) {
                setValidationError(`${currentChartType.name} 至少需要 ${minRequiredYColumns} 个 Y 轴`);
                return false;
            }
            if (yAxisColumns.includes(xAxisColumn)) {
                setValidationError("X 轴和 Y 轴不能选择同一列");
                return false;
            }
            const uniqueYAxes = new Set(yAxisColumns);
            if (uniqueYAxes.size !== yAxisColumns.length) {
                setValidationError("Y 轴不能选择重复的列");
                return false;
            }

            const allAxes = [xAxisColumn, ...yAxisColumns];
            for (const column of allAxes) {
                const statusItem = columnsVisualizableStatus.find(
                    (status) => status.column === column,
                );
                if (statusItem && !statusItem.isVisualizable) {
                    setValidationError(
                        `列 "${column}" 不适合作为坐标轴。${statusItem.reason}`,
                    );
                    return false;
                }
            }
        } else {
            // Validation for chart types without axes (e.g., Pie)
            // Might still need column selection logic if not handled by AxisSelector
            // If using a generic approach, this part might need refinement
        }

        setValidationError("");
        return true;
    };

    /**
     * 处理添加图表
     */
    const handleAddChart = () => {
        if (!validateForm() || !rawFileData) {
            if (!rawFileData) setValidationError("原始数据不可用，请重新上传文件。");
            return;
        }

        let processedResult: Partial<ChartConfig> & { error?: string } = {};
        const baseConfig = {
            xAxisColumn,
            yAxisColumns: selectedChartType === 'line' ? yAxisColumns : undefined,
            yAxisColumn: selectedChartType === 'bar' ? yAxisColumns[0] : undefined,
        };

        try {
            if (selectedChartType === "bar") {
                if (!baseConfig.yAxisColumn) throw new Error("Bar chart requires one Y axis.");
                processedResult = processBarChartData(rawFileData, {
                    xAxisColumn: baseConfig.xAxisColumn,
                    yAxisColumn: baseConfig.yAxisColumn,
                });
            } else if (selectedChartType === "line") {
                processedResult = processLineChartData(rawFileData, {
                    xAxisColumn: baseConfig.xAxisColumn,
                    yAxisColumns: yAxisColumns,
                });
            } else {
                console.warn(`Processing logic for chart type '${selectedChartType}' not fully implemented.`);
                processedResult = { processedData: [] };
            }

            if (processedResult.error) {
                throw new Error(processedResult.error);
            }

            const newChart: ChartConfig = {
                id: `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                chartType: selectedChartType as ChartType,
                title: chartTitle || `${currentChartType?.name || 'Chart'} for ${xAxisColumn}${yAxisColumns.length > 0 ? ` vs ${yAxisColumns.join(', ')}` : ''}`,
                xAxisColumn: xAxisColumn,
                yAxisColumns: yAxisColumns,
                ...processedResult,
                processedData: processedResult.processedData || [],
            };

            addChart(newChart);
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error processing or adding chart:", error);
            setValidationError(`处理图表数据时出错: ${error.message}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>添加可视化图表</DialogTitle>
                    <DialogDescription>
                        选择图表类型、配置数据轴和标题。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* 1. Chart Type Selection */}
                    <ChartTypeSelector
                        selectedChartType={selectedChartType}
                        onChartTypeChange={setSelectedChartType}
                    />

                    {/* 2. Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="chart-title">图表标题 (可选)</Label>
                        <Input
                            id="chart-title"
                            value={chartTitle}
                            onChange={(e) => setChartTitle(e.target.value)}
                            placeholder={`例如: ${currentChartType?.name || '图表'}`}
                        />
                    </div>

                    {/* 3. Axis Selection (conditionally rendered) */}
                    {requiresAxis && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <h4 className="text-sm font-medium mb-2">配置坐标轴</h4>
                            {/* X Axis Selector using ui/select */}
                            <div className="space-y-2">
                                <Label>X 轴 (类别/时间)</Label>
                                <Select
                                    value={xAxisColumn}
                                    onValueChange={handleXAxisChange}
                                    disabled={visualizableColumns.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择 X 轴" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visualizableColumns.length > 0 ? (
                                            visualizableColumns.map((col) => (
                                                <SelectItem
                                                    key={`x-${col}`}
                                                    value={col}
                                                    disabled={yAxisColumns.includes(col)}
                                                >
                                                    {col}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="" disabled>
                                                无可用的可视化列
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Y Axis Selector(s) using ui/select */}
                            <div className="space-y-2">
                                <Label>Y 轴 (值/计数)</Label>
                                {yAxisColumns.map((yCol, index) => (
                                    <div key={`y-axis-${index}`} className="flex items-center gap-2">
                                        <Select
                                            value={yCol}
                                            onValueChange={(value) => handleYAxisChange(index, value)}
                                            disabled={visualizableColumns.length === 0}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`选择 Y 轴 ${index + 1}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {visualizableColumns.length > 0 ? (
                                                    visualizableColumns.map((col) => (
                                                        <SelectItem
                                                            key={`y${index}-${col}`}
                                                            value={col}
                                                            disabled={col === xAxisColumn || yAxisColumns.some((otherY, i) => i !== index && otherY === col)}
                                                        >
                                                            {col}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="" disabled>
                                                        无可用的可视化列
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {(allowMultipleY || yAxisColumns.length > minRequiredYColumns) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeYAxis(index)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                aria-label="移除 Y 轴"
                                            >
                                                <MinusCircle size={14} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {allowMultipleY && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addYAxis}
                                        className="mt-2 flex items-center gap-1 text-xs"
                                        disabled={visualizableColumns.length <= yAxisColumns.length + (xAxisColumn ? 1 : 0)}
                                    >
                                        <PlusCircle size={12} /> 添加 Y 轴
                                    </Button>
                                )}
                                {yAxisColumns.length === 0 && !allowMultipleY && requiresAxis && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addYAxis}
                                        className="mt-2 flex items-center gap-1 text-xs"
                                        disabled={visualizableColumns.length <= (xAxisColumn ? 1 : 0)}
                                    >
                                        <PlusCircle size={12} /> 添加 Y 轴
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Validation Error Display */}
                    {validationError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-md">
                            <AlertCircle size={16} />
                            <span>{validationError}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
                    <Button onClick={handleAddChart} disabled={!rawFileData || !!validationError}>
                        添加图表
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddChartModal; 