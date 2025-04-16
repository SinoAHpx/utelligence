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
import { processBarChartData, processLineChartData, processAreaChartData, processPieChartData } from "@/utils/data-processing";
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

    // Determine chart properties based on selected type
    const currentChartType = useMemo(() => CHART_TYPES.find((type) => type.id === selectedChartType), [selectedChartType]);
    const requiresAxis = currentChartType?.requiresAxis ?? false;
    // Pie charts don't require axes but need 1 column (handled by yAxisColumns check)
    const minRequiredYColumns = requiresAxis ? 1 : 1; // Pie needs 1 column selected via Y-axis selector
    const allowMultipleY = selectedChartType === 'line' || selectedChartType === 'area';

    // Filter visualizable columns
    const visualizableColumns = useMemo(() => availableColumns.filter((col) => {
        const status = columnsVisualizableStatus.find((s) => s.column === col);
        // For axis charts, require visualizability.
        // For pie charts, allow if visualizable OR if not empty (uniqueValues > 0).
        return status && (requiresAxis ? status.isVisualizable : (status.isVisualizable || status.uniqueValues > 0));
    }), [availableColumns, columnsVisualizableStatus, requiresAxis]);

    // Reset form when modal opens or chart type changes
    useEffect(() => {
        if (open) {
            resetForm(selectedChartType);
        }
    }, [open]);

    // Reset axes/selection when chart type changes
    useEffect(() => {
        resetSelection();
        setValidationError("");
    }, [selectedChartType]);

    // Reset form helper
    const resetForm = (chartType: string = "bar") => {
        setSelectedChartType(chartType);
        setChartTitle("");
        resetSelection();
        setValidationError("");
    };

    // Reset axes/column selection helper
    const resetSelection = () => {
        setXAxisColumn("");
        setYAxisColumns([]); // Reset Y columns (used for pie too)
    };

    // --- Axis/Column Selection Handlers ---

    const handleXAxisChange = (value: string) => {
        setXAxisColumn(value);
        setYAxisColumns(yAxisColumns.filter(col => col !== value));
        setValidationError("");
    };

    const addYAxis = () => {
        const nextAvailable = visualizableColumns.find(
            col => col !== xAxisColumn && !yAxisColumns.includes(col)
        );
        if (nextAvailable) {
            // For single-column charts like Pie, replace the selection
            if (!requiresAxis) {
                setYAxisColumns([nextAvailable]);
            } else {
                setYAxisColumns([...yAxisColumns, nextAvailable]);
            }
            setValidationError("");
        }
    };

    const removeYAxis = (indexToRemove: number) => {
        setYAxisColumns(yAxisColumns.filter((_, index) => index !== indexToRemove));
        setValidationError("");
    };

    // Handle change for Y axis (or the single column for Pie)
    const handleYAxisChange = (indexToChange: number, newValue: string) => {
        // Prevent selecting the same column as X if axes are required
        if (requiresAxis && newValue === xAxisColumn) return;
        // Prevent duplicates if multiple Y are allowed
        if (allowMultipleY && yAxisColumns.some((col, idx) => idx !== indexToChange && col === newValue)) return;

        const newYAxes = [...yAxisColumns];
        newYAxes[indexToChange] = newValue;
        setYAxisColumns(newYAxes);
        setValidationError("");
    };

    // Simplified handler for single column selection (like Pie)
    const handleSingleColumnChange = (value: string) => {
        setYAxisColumns([value]); // Store in the first Y column slot
        setValidationError("");
    };

    /**
     * 验证表单数据 - Updated for Pie Chart
     */
    const validateForm = (): boolean => {
        if (!currentChartType) {
            setValidationError("请选择有效的图表类型");
            return false;
        }

        if (requiresAxis) {
            // Validation for axis-based charts (Bar, Line, Area, Scatter, Radar)
            if (!xAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择 X 轴`);
                return false;
            }
            if (yAxisColumns.length < minRequiredYColumns) {
                setValidationError(`${currentChartType.name} 至少需要 ${minRequiredYColumns} 个 Y 轴`);
                return false;
            }
            if (!allowMultipleY && yAxisColumns.length > 1) {
                setValidationError(`${currentChartType.name} 只支持一个 Y 轴`);
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
                const statusItem = columnsVisualizableStatus.find(status => status.column === column);
                if (statusItem && !statusItem.isVisualizable) {
                    setValidationError(`列 "${column}" 可能不适合作为坐标轴。${statusItem.reason}`);
                    // return false; // Decide if this should be a hard block or warning
                }
            }
        } else {
            // Validation for non-axis charts (Pie)
            if (yAxisColumns.length !== 1) {
                setValidationError(`${currentChartType.name} 需要选择正好 1 列数据`);
                return false;
            }
            const pieColumn = yAxisColumns[0];
            const statusItem = columnsVisualizableStatus.find(status => status.column === pieColumn);
            // Check if the selected column has at least one unique value (i.e., not empty)
            if (!statusItem || statusItem.uniqueValues <= 0) {
                setValidationError(`列 "${pieColumn}" 数据为空或无效，无法生成饼图`);
                return false;
            }
            // Keep the check for single unique value
            if (statusItem.uniqueValues === 1) {
                setValidationError(`列 "${pieColumn}" 数据值单一，不适合生成饼图`);
                return false;
            }
        }

        setValidationError("");
        return true;
    };

    /**
     * 处理添加图表 - Updated for Pie Chart
     */
    const handleAddChart = () => {
        if (!validateForm() || !rawFileData) {
            if (!rawFileData) setValidationError("原始数据不可用，请重新上传文件。");
            return;
        }

        let processedResult: Partial<ChartConfig> & { error?: string } = {};
        const valueColumnForPie = yAxisColumns[0]; // Use the first selected Y column for Pie

        try {
            switch (selectedChartType) {
                case "bar":
                    if (!yAxisColumns[0]) throw new Error("柱状图需要一个 Y 轴。");
                    processedResult = processBarChartData(rawFileData, {
                        xAxisColumn: xAxisColumn,
                        yAxisColumn: yAxisColumns[0],
                    });
                    break;
                case "line":
                    processedResult = processLineChartData(rawFileData, {
                        xAxisColumn: xAxisColumn,
                        yAxisColumns: yAxisColumns,
                    });
                    break;
                case "area":
                    processedResult = processAreaChartData(rawFileData, {
                        xAxisColumn: xAxisColumn,
                        yAxisColumns: yAxisColumns,
                    });
                    break;
                case "pie": // Add case for Pie Chart
                    if (!valueColumnForPie) throw new Error("饼图需要选择一列数据。");
                    processedResult = processPieChartData(rawFileData, {
                        valueColumn: valueColumnForPie,
                    });
                    break;
                // Add cases for scatter, radar etc.
                default:
                    console.warn(`Processing logic for chart type '${selectedChartType}' not implemented.`);
                    processedResult = { processedData: [] };
            }

            if (processedResult.error) {
                throw new Error(processedResult.error);
            }

            // Construct the final chart config
            const newChart: ChartConfig = {
                id: `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                chartType: selectedChartType as ChartType,
                // Adjust title based on axes/no axes
                title: chartTitle || `${currentChartType?.name || 'Chart'} ${requiresAxis ? `for ${xAxisColumn} vs ${yAxisColumns.join(', ')}` : `of ${yAxisColumns[0]}`}`,
                xAxisColumn: requiresAxis ? xAxisColumn : undefined, // Only set xAxis if required
                yAxisColumns: yAxisColumns, // Store all selected Y columns (even for Pie, it's in yAxisColumns[0])
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
                        选择图表类型、配置数据列和标题。
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
                            placeholder={`例如: ${currentChartType?.name || '图表'} ${requiresAxis ? `by ${xAxisColumn || 'X'}` : `of ${yAxisColumns[0] || '列'}`}`}
                        />
                    </div>

                    {/* 3. Axis Selection (shown for charts requiring axes) */}
                    {requiresAxis && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <h4 className="text-sm font-medium mb-2">配置坐标轴</h4>
                            {/* X Axis Selector */}
                            <div className="space-y-2">
                                <Label>X 轴</Label>
                                <Select
                                    value={xAxisColumn}
                                    onValueChange={handleXAxisChange}
                                    disabled={visualizableColumns.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择 X 轴" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visualizableColumns.map((col) => (
                                            <SelectItem key={`x-${col}`} value={col} disabled={yAxisColumns.includes(col)}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Y Axis Selector(s) */}
                            <div className="space-y-2">
                                <Label>Y 轴</Label>
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
                                                {visualizableColumns.map((col) => (
                                                    <SelectItem
                                                        key={`y${index}-${col}`}
                                                        value={col}
                                                        disabled={col === xAxisColumn || yAxisColumns.some((otherY, i) => i !== index && otherY === col)}
                                                    >
                                                        {col}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {(allowMultipleY || yAxisColumns.length > minRequiredYColumns) && (
                                            <Button variant="ghost" size="icon" onClick={() => removeYAxis(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" aria-label="移除 Y 轴">
                                                <MinusCircle size={14} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {/* Add Y axis button */}
                                {allowMultipleY && (
                                    <Button variant="outline" size="sm" onClick={addYAxis} className="mt-2 flex items-center gap-1 text-xs" disabled={visualizableColumns.length <= yAxisColumns.length + (xAxisColumn ? 1 : 0)}>
                                        <PlusCircle size={12} /> 添加 Y 轴
                                    </Button>
                                )}
                                {yAxisColumns.length === 0 && requiresAxis && (
                                    <Button variant="outline" size="sm" onClick={addYAxis} className="mt-2 flex items-center gap-1 text-xs" disabled={visualizableColumns.length <= (xAxisColumn ? 1 : 0)}>
                                        <PlusCircle size={12} /> 添加 Y 轴
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Single Column Selection (shown for non-axis charts like Pie) */}
                    {!requiresAxis && (
                        <div className="space-y-2 p-4 border rounded-md">
                            <Label>选择数据列</Label>
                            <Select
                                value={yAxisColumns[0] || ""} // Use first Y column slot
                                onValueChange={handleSingleColumnChange}
                                disabled={visualizableColumns.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`选择用于 ${currentChartType?.name || '图表'} 的列`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {visualizableColumns.map((col) => (
                                        <SelectItem key={`pie-col-${col}`} value={col}>
                                            {col}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {currentChartType?.name} 将显示此列中不同值的占比。
                            </p>
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