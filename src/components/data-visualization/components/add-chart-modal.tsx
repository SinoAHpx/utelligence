import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDataVisualizationStore } from "@/store/dataVisualizationStore";
import { CHART_TYPES, ChartType, ChartConfig } from "@/types/chart-types";
import { processBarChartData } from "@/utils/data-processing";
import ColumnSelector from "./column-selector";
import AxisSelector from "./axis-selector";
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
        selectedColumnsForChart, setSelectedColumnsForChart,
        chartTitle, setChartTitle,
        xAxisColumn, setXAxisColumn,
        yAxisColumn, setYAxisColumn,
        columnsVisualizableStatus,
        addChart,
        rawFileData,
    } = useDataVisualizationStore();

    const [validationError, setValidationError] = useState<string>("");

    // Get current chart type definition
    const currentChartType = CHART_TYPES.find((type) => type.id === selectedChartType);
    const requiresAxis = currentChartType?.requiresAxis ?? false;
    const requiredColumnsCount = currentChartType?.requiresColumns ?? 1;

    // Filter suitable columns for axes based on visualization status
    const visualizableColumns = availableColumns.filter((col) => {
        const status = columnsVisualizableStatus.find((s) => s.column === col);
        return status?.isVisualizable ?? false;
    });

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    // Auto-select axes for bar charts when X or Y changes, ensuring they are different
    useEffect(() => {
        if (selectedChartType === "bar") {
            // If X is selected, try to select a different Y
            if (xAxisColumn && (!yAxisColumn || yAxisColumn === xAxisColumn)) {
                const possibleY = visualizableColumns.find(col => col !== xAxisColumn);
                if (possibleY) setYAxisColumn(possibleY);
                else setYAxisColumn(""); // Clear Y if no other option
            }
            // If Y is selected, try to select a different X
            else if (yAxisColumn && (!xAxisColumn || xAxisColumn === yAxisColumn)) {
                const possibleX = visualizableColumns.find(col => col !== yAxisColumn);
                if (possibleX) setXAxisColumn(possibleX);
                else setXAxisColumn(""); // Clear X if no other option
            }
            // If neither is selected, try setting defaults
            else if (!xAxisColumn && !yAxisColumn && visualizableColumns.length >= 2) {
                setXAxisColumn(visualizableColumns[0]);
                setYAxisColumn(visualizableColumns[1]);
            }
        }
    }, [selectedChartType, xAxisColumn, yAxisColumn, visualizableColumns, setXAxisColumn, setYAxisColumn]);

    // Handler for selecting X axis (specific for bar charts)
    const handleXAxisChange = (value: string) => {
        setXAxisColumn(value);
        setValidationError("");
    };

    // Handler for selecting Y axis (specific for bar charts)
    const handleYAxisChange = (value: string) => {
        setYAxisColumn(value);
        setValidationError("");
    };

    // Handler specifically for the ColumnSelector component (for non-bar charts)
    const handleColumnSelectionToggle = (column: string) => {
        const currentlySelected = selectedColumnsForChart;
        const maxSelection = requiredColumnsCount;

        if (currentlySelected.includes(column)) {
            setSelectedColumnsForChart(currentlySelected.filter(col => col !== column));
        } else {
            if (currentlySelected.length < maxSelection) {
                setSelectedColumnsForChart([...currentlySelected, column]);
            }
        }
        setValidationError(""); // Clear validation on change
        // Note: Axis selection logic for non-bar charts would need to be handled
        // based on `selectedColumnsForChart` changes if needed.
    };

    /**
     * 验证表单数据
     * 检查图表配置的有效性
     */
    const validateForm = (): boolean => {
        if (!currentChartType) {
            setValidationError("请选择有效的图表类型");
            return false;
        }

        if (currentChartType.id === "bar") {
            if (!xAxisColumn) {
                setValidationError("柱状图需要选择X轴");
                return false;
            }
            if (!yAxisColumn) {
                setValidationError("柱状图需要选择Y轴");
                return false;
            }
            if (xAxisColumn === yAxisColumn) {
                setValidationError("X轴和Y轴不能选择同一列");
                return false;
            }
        } else {
            // Validation for other chart types (using ColumnSelector)
            if (selectedColumnsForChart.length < requiredColumnsCount) {
                setValidationError(
                    `${currentChartType.name}需要选择${requiredColumnsCount}列数据`,
                );
                return false;
            }

            // Add validation for axis requirements if applicable for other types
            if (requiresAxis && selectedColumnsForChart.length >= 2 /* && needs specific axis validation */) {
                // Placeholder for future axis validation for other types
            }

            // Validate visualizability for non-scatter types (using selectedColumnsForChart)
            if (selectedChartType !== "scatter") {
                for (const column of selectedColumnsForChart) {
                    const statusItem = columnsVisualizableStatus.find(
                        (status) => status.column === column,
                    );
                    if (statusItem && !statusItem.isVisualizable) {
                        setValidationError(
                            `列 "${column}" 不适合可视化。${statusItem.reason}`,
                        );
                        return false;
                    }
                }
            }
        }

        setValidationError("");
        return true;
    };

    /**
     * 处理添加图表
     * 验证数据并创建新图表
     */
    const handleAddChart = () => {
        if (!validateForm() || !rawFileData) {
            if (!rawFileData) setValidationError("Raw data not available.");
            return;
        }

        let processedResult: Pick<
            ChartConfig,
            "processedData" | "layout" | "yCategories" | "yKey"
        > & { error?: string } = {};

        if (selectedChartType === "bar") {
            processedResult = processBarChartData(rawFileData, {
                xAxisColumn,
                yAxisColumn,
            });
            

            if (processedResult.error) {
                setValidationError(`Data Processing Error: ${processedResult.error}`);
                return;
            }
        } else {
            // TODO: Add processing logic for other chart types here
            // For now, we'll just pass basic config
            setValidationError("Processing for this chart type is not yet implemented.");
            return; // Prevent adding unimplemented charts
        }

        // Construct the final chart config
        const newChart: ChartConfig = {
            id: `chart-${Math.random().toString(36).substring(2, 9)}`,
            chartType: selectedChartType,
            title: chartTitle || `${currentChartType?.name} 图表`,
            xAxisColumn, // Store original selections
            yAxisColumn,
            processedData: processedResult.processedData,
            layout: processedResult.layout,
            yCategories: processedResult.yCategories,
            yKey: processedResult.yKey,
            // columns: selectedColumnsForChart, // Store if needed for other types
        };

        addChart(newChart);
        onOpenChange(false);
        // resetForm() is called by useEffect when modal opens
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
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>添加可视化图表</DialogTitle>
                    <DialogDescription>
                        选择图表类型和配置数据轴
                        {currentChartType && (
                            <span className="ml-1">
                                ({currentChartType.name})
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Chart Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="chart-title">图表标题</Label>
                        <Input
                            id="chart-title"
                            value={chartTitle}
                            onChange={(e) => setChartTitle(e.target.value)}
                            placeholder={`输入图表标题（默认为 ${currentChartType?.name} 图表）`}
                        />
                    </div>

                    {/* Chart Type Selector */}
                    <div className="space-y-2">
                        <Label>图表类型</Label>
                        <ChartTypeSelector
                            selectedChartType={selectedChartType}
                            onChartTypeChange={setSelectedChartType}
                        />
                    </div>

                    {/* --- Bar Chart Specific Configuration --- */}
                    {selectedChartType === "bar" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* X-Axis Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="x-axis-select">X轴（分类轴）</Label>
                                <Select
                                    onValueChange={handleXAxisChange}
                                    value={xAxisColumn}
                                    disabled={visualizableColumns.length === 0}
                                >
                                    <SelectTrigger id="x-axis-select">
                                        <SelectValue placeholder="选择X轴" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visualizableColumns.length > 0 ? (
                                            visualizableColumns.map((col) => (
                                                <SelectItem key={col} value={col}>
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

                            {/* Y-Axis Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="y-axis-select">Y轴（计数/分类轴）</Label>
                                <Select
                                    onValueChange={handleYAxisChange}
                                    value={yAxisColumn}
                                    disabled={visualizableColumns.length === 0}
                                >
                                    <SelectTrigger id="y-axis-select">
                                        <SelectValue placeholder="选择Y轴" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visualizableColumns.length > 0 ? (
                                            visualizableColumns.map((col) => (
                                                <SelectItem
                                                    key={col}
                                                    value={col}
                                                    disabled={col === xAxisColumn} // Disable selecting the same as X axis
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
                        </div>
                    )}

                    {/* --- Column Selector for OTHER Chart Types --- */}
                    {selectedChartType !== "bar" && (
                        <div className="space-y-2">
                            <Label>选择数据列</Label>
                            <ColumnSelector
                                columns={availableColumns}
                                selectedColumns={selectedColumnsForChart}
                                onColumnToggle={handleColumnSelectionToggle}
                                maxColumns={requiredColumnsCount}
                                columnsVisualizableStatus={columnsVisualizableStatus}
                            />
                            <p className="text-xs text-muted-foreground">
                                已选择 {selectedColumnsForChart.length} / {requiredColumnsCount} 列
                            </p>
                        </div>
                    )}

                    {/* Validation Error Display */}
                    {validationError && (
                        <div className="flex items-center p-2 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={handleAddChart}>添加图表</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddChartModal; 