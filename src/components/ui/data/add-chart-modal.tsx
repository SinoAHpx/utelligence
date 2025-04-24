import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, MinusCircle, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import { visualizationChartStore, fileDataStore } from "@/store/index";
import { CHART_TYPES, ChartType, ChartConfig } from "@/types/chart-types";
import { processBarChartData, processLineChartData, processAreaChartData, processPieChartData, processScatterChartData, processRadarChartData } from "@/utils/data/data-processing";
import ChartTypeSelector from "./chart-type-selector";

interface AddChartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allColumns: string[];
}

/**
 * 添加图表对话框组件
 * 允许用户配置和添加新的可视化图表
 */
export const AddChartModal: React.FC<AddChartModalProps> = ({
    open,
    onOpenChange,
    allColumns: allColumns,
}) => {
    const {
        selectedChartType, setSelectedChartType,
        chartTitle, setChartTitle,
        xAxisColumn, setXAxisColumn,
        yAxisColumn, setYAxisColumn,
        columnsVisualizableStatus,
        addChart,
    } = visualizationChartStore();

    const {
        rawFileData,
    } = fileDataStore();

    const [validationError, setValidationError] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Determine chart properties based on selected type
    const currentChartType = useMemo(() => CHART_TYPES.find((type) => type.id === selectedChartType), [selectedChartType]);
    const requiresAxis = currentChartType?.requiresAxis ?? false;

    // Filter visualizable columns
    const visualizableColumns = useMemo(() => allColumns.filter((col) => {
        const status = columnsVisualizableStatus.find((s) => s.column === col);
        if (!status) return false;
        if (requiresAxis) {
            return status.isVisualizable;
        } else {
            return status.isVisualizable || status.uniqueValues > 0;
        }
    }), [allColumns, columnsVisualizableStatus, requiresAxis]);

    // Reset form when modal opens or chart type changes
    useEffect(() => {
        if (open) {
            resetForm(selectedChartType);
        }
    }, [open]);

    // Reset selection when chart type changes
    useEffect(() => {
        resetSelection();
        setValidationError("");
    }, [selectedChartType]);

    const resetForm = (chartType: string = "bar") => {
        setSelectedChartType(chartType);
        setChartTitle("");
        resetSelection();
        setValidationError("");
        setIsProcessing(false);
    };

    const resetSelection = () => {
        setXAxisColumn("");
        setYAxisColumn("");
    };

    // --- Axis/Column Selection Handlers ---

    const handleXAxisChange = (value: string) => {
        setXAxisColumn(value);
        if (yAxisColumn === value) {
            setYAxisColumn("");
        }
        setValidationError("");
    };

    const handleYAxisChange = (value: string) => {
        if (requiresAxis && value === xAxisColumn) {
            return;
        }
        setYAxisColumn(value);
        setValidationError("");
    };

    /**
     * 验证表单数据 - Simplified for single Y axis
     */
    const validateForm = (): boolean => {
        if (!currentChartType) {
            setValidationError("请选择有效的图表类型");
            return false;
        }

        // Special handling for radar charts which only need X axis
        if (selectedChartType === 'radar') {
            if (!xAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择分类列`);
                return false;
            }
            const xStatus = columnsVisualizableStatus.find(s => s.column === xAxisColumn);
            if (!xStatus) {
                setValidationError(`列 "${xAxisColumn}" 状态未知`);
                return false;
            }

            // Check if column is appropriate for radar chart
            if (!xStatus.isVisualizable) {
                if (xStatus.uniqueValues <= 1) {
                    setValidationError(`列 "${xAxisColumn}" 不适合用于雷达图：值过少`);
                    return false;
                }

                if (xStatus.uniqueValues >= xStatus.totalValues * 0.9) {
                    setValidationError(`列 "${xAxisColumn}" 不适合用于雷达图：几乎每行都有唯一值`);
                    return false;
                }
            }

            // Warn if there might not be enough values after filtering empty values
            if (xStatus.uniqueValues < 3) {
                setValidationError(`列 "${xAxisColumn}" 可能没有足够的不同值用于雷达图 (至少需要3个)`);
                return false;
            }

            return true;
        }

        if (requiresAxis) {
            if (!xAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择 X 轴`);
                return false;
            }
            if (!yAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择 Y 轴`);
                return false;
            }
            if (xAxisColumn === yAxisColumn) {
                setValidationError("X 轴和 Y 轴不能选择同一列");
                return false;
            }
            const xStatus = columnsVisualizableStatus.find(s => s.column === xAxisColumn);
            const yStatus = columnsVisualizableStatus.find(s => s.column === yAxisColumn);
            if (selectedChartType === 'scatter' && (!xStatus?.isVisualizable || !yStatus?.isVisualizable)) {
                console.warn('Selected columns might not be ideal for scatter plot.');
            }
        } else {
            if (!yAxisColumn) {
                setValidationError(`${currentChartType.name} 需要选择 1 列数据`);
                return false;
            }
            const statusItem = columnsVisualizableStatus.find(status => status.column === yAxisColumn);
            if (!statusItem || statusItem.uniqueValues <= 0) {
                setValidationError(`列 "${yAxisColumn}" 数据为空或无效`);
                return false;
            }
            if (statusItem.uniqueValues === 1) {
                setValidationError(`列 "${yAxisColumn}" 数据值单一，不适合生成饼图`);
                return false;
            }
        }

        setValidationError("");
        return true;
    };

    /**
     * 处理添加图表 - Simplified for single Y axis + Loading State
     */
    const handleAddChart = async () => {
        if (!validateForm()) return;
        if (!rawFileData) {
            setValidationError("原始数据不可用，请重新上传文件。");
            return;
        }

        setIsProcessing(true);
        setValidationError("");

        await new Promise(resolve => setTimeout(resolve, 50));

        let processedResult: Partial<ChartConfig> & { error?: string; isTruncated?: boolean } = {};

        try {
            const configParams = { xAxisColumn, yAxisColumn };

            switch (selectedChartType) {
                case "bar":
                    if (!yAxisColumn) throw new Error("柱状图需要一个 Y 轴。");
                    processedResult = processBarChartData(rawFileData, configParams);
                    break;
                case "line":
                    processedResult = processLineChartData(rawFileData, configParams);
                    break;
                case "area":
                    processedResult = processAreaChartData(rawFileData, configParams);
                    break;
                case "pie":
                    processedResult = processPieChartData(rawFileData, { valueColumn: yAxisColumn });
                    break;
                case "scatter":
                    processedResult = processScatterChartData(rawFileData, configParams);
                    break;
                case "radar":
                    processedResult = processRadarChartData(rawFileData, { xAxisColumn });
                    break;
                default:
                    console.warn(`Processing logic for chart type '${selectedChartType}' not implemented.`);
                    processedResult = { processedData: [] };
            }

            if (processedResult.error) {
                throw new Error(processedResult.error);
            }

            // Create chart config with different parameters based on chart type
            let chartConfig: Omit<ChartConfig, 'id'> = {
                chartType: selectedChartType as ChartType,
                ...processedResult,
                processedData: processedResult.processedData || [],
                title: chartTitle || `Chart-${Date.now()}`, // Default title to ensure it's never undefined
            };

            // Set title based on chart type
            if (!chartTitle) {
                if (selectedChartType === 'radar') {
                    chartConfig.title = `${currentChartType?.name || '雷达图'} - ${xAxisColumn} 值分布`;
                } else if (requiresAxis) {
                    chartConfig.title = `${currentChartType?.name || 'Chart'} for ${xAxisColumn} vs ${yAxisColumn}`;
                } else {
                    chartConfig.title = `${currentChartType?.name || 'Chart'} of ${yAxisColumn}`;
                }
            }

            // Set axes based on chart type
            if (selectedChartType === 'radar') {
                chartConfig.xAxisColumn = xAxisColumn;
                chartConfig.yAxisColumn = undefined;
            } else if (requiresAxis) {
                chartConfig.xAxisColumn = xAxisColumn;
                chartConfig.yAxisColumn = yAxisColumn;
            } else {
                chartConfig.xAxisColumn = undefined;
                chartConfig.yAxisColumn = yAxisColumn;
            }

            const newChart: ChartConfig = {
                id: `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                ...chartConfig
            };

            addChart(newChart);
            onOpenChange(false);

        } catch (error: any) {
            console.error("Error processing or adding chart:", error);
            setValidationError(`处理图表数据时出错: ${error.message}`);
        } finally {
            setIsProcessing(false);
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
                            placeholder={`例如: ${currentChartType?.name || '图表'} ${requiresAxis ? `by ${xAxisColumn || 'X'}` : `of ${yAxisColumn || '列'}`}`}
                        />
                    </div>

                    {/* 3. Axis Selection (shown for charts requiring axes) - Horizontal Layout */}
                    {requiresAxis && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <h4 className="text-sm font-medium mb-2">配置坐标轴</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* X Axis Selector */}
                                <div className="space-y-2">
                                    <Label>
                                        {selectedChartType === 'radar'
                                            ? '分类列'
                                            : `X 轴 ${selectedChartType === 'scatter' ? ' (数值)' : ''}`}
                                    </Label>
                                    <Select
                                        value={xAxisColumn}
                                        onValueChange={handleXAxisChange}
                                        disabled={visualizableColumns.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedChartType === 'radar' ? "选择分类列" : "选择 X 轴"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {visualizableColumns.map((col) => (
                                                <SelectItem key={`x-${col}`} value={col} disabled={col === yAxisColumn}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedChartType === 'radar' && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            雷达图将会统计此列中不同值的出现次数，空值(包括null、N/A、undefined、空字符串等)会被自动忽略
                                        </p>
                                    )}
                                </div>

                                {/* Y Axis Selector (Not shown for Radar charts) */}
                                {selectedChartType !== 'radar' && (
                                    <div className="space-y-2">
                                        <Label>Y 轴 {selectedChartType === 'scatter' ? ' (数值)' : ''}</Label>
                                        <Select
                                            value={yAxisColumn}
                                            onValueChange={handleYAxisChange}
                                            disabled={visualizableColumns.length === 0}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`选择 Y 轴`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {visualizableColumns.map((col) => (
                                                    <SelectItem
                                                        key={`y-${col}`}
                                                        value={col}
                                                        disabled={col === xAxisColumn}
                                                    >
                                                        {col}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Single Column Selection (Pie) */}
                    {!requiresAxis && (
                        <div className="space-y-2 p-4 border rounded-md">
                            <Label>选择数据列</Label>
                            <Select
                                value={yAxisColumn}
                                onValueChange={handleYAxisChange}
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
                    <Button onClick={handleAddChart} disabled={!rawFileData || !!validationError || isProcessing}>
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 处理中...</>
                        ) : (
                            "添加图表"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddChartModal; 