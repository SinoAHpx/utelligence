import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface AxisSelectorProps {
    columns: string[];
    xAxisColumn: string;
    yAxisColumn: string;
    onXAxisChange: (column: string) => void;
    onYAxisChange: (column: string) => void;
}

export const AxisSelector: React.FC<AxisSelectorProps> = ({
    columns,
    xAxisColumn,
    yAxisColumn,
    onXAxisChange,
    onYAxisChange,
}) => {
    // Auto-select axes when columns change or if no axes are selected
    useEffect(() => {
        if (columns.length >= 2) {
            // If no axes are selected, select the first two columns
            if (!xAxisColumn && !yAxisColumn) {
                onXAxisChange(columns[0]);
                onYAxisChange(columns[1]);
            }
            // If only X is selected, select a Y that's different from X
            else if (xAxisColumn && !yAxisColumn) {
                const otherColumn = columns.find(col => col !== xAxisColumn);
                if (otherColumn) {
                    onYAxisChange(otherColumn);
                }
            }
            // If only Y is selected, select an X that's different from Y
            else if (!xAxisColumn && yAxisColumn) {
                const otherColumn = columns.find(col => col !== yAxisColumn);
                if (otherColumn) {
                    onXAxisChange(otherColumn);
                }
            }
        }
    }, [columns, xAxisColumn, yAxisColumn, onXAxisChange, onYAxisChange]);

    // Handle swap button click
    const handleSwapAxes = () => {
        const tempX = xAxisColumn;
        onXAxisChange(yAxisColumn);
        onYAxisChange(tempX);
    };

    // If using a radar chart (3+ columns), show special message
    const isMultiDimensional = columns.length >= 3;

    return (
        <div className="space-y-3 border-t pt-3 mt-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">坐标轴设置</h4>
                {!isMultiDimensional && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSwapAxes}
                        className="h-8 flex items-center"
                    >
                        <ArrowLeftRight size={14} className="mr-1" />
                        交换坐标轴
                    </Button>
                )}
            </div>

            {isMultiDimensional ? (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">多维数据可视化</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        当前已选择{columns.length}列数据。在多维图表中：
                    </p>
                    <ul className="mt-1 space-y-1">
                        <li className="text-xs flex items-center text-blue-600 dark:text-blue-400">
                            <div className="h-3 w-3 mr-1 rounded-full bg-blue-500" />
                            <span>第一列 <span className="font-medium">"{columns[0]}"</span> 将作为分类</span>
                        </li>
                        <li className="text-xs flex items-center text-blue-600 dark:text-blue-400">
                            <div className="h-3 w-3 mr-1 rounded-full bg-green-500" />
                            <span>其余{columns.length - 1}列将作为不同维度的指标值</span>
                        </li>
                    </ul>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 rounded-full bg-blue-500" />
                            <Label className="text-sm font-medium">X轴: {xAxisColumn}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">作为水平轴</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 rounded-full bg-green-500" />
                            <Label className="text-sm font-medium">Y轴: {yAxisColumn}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">作为垂直轴</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AxisSelector; 