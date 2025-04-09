import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    // Auto-select the other axis when there are only two columns
    useEffect(() => {
        if (columns.length === 2) {
            if (xAxisColumn && !yAxisColumn) {
                // If X is selected but Y is not, auto-select Y
                const otherColumn = columns.find(col => col !== xAxisColumn);
                if (otherColumn) {
                    onYAxisChange(otherColumn);
                }
            } else if (yAxisColumn && !xAxisColumn) {
                // If Y is selected but X is not, auto-select X
                const otherColumn = columns.find(col => col !== yAxisColumn);
                if (otherColumn) {
                    onXAxisChange(otherColumn);
                }
            }
        }
    }, [columns, xAxisColumn, yAxisColumn, onXAxisChange, onYAxisChange]);

    return (
        <div className="space-y-3 border-t pt-3 mt-2">
            <h4 className="text-sm font-medium">设置坐标轴</h4>

            <div className="flex flex-row gap-4">
                <div className="space-y-2 flex-1">
                    <Label>X轴（水平轴）</Label>
                    <RadioGroup
                        value={xAxisColumn}
                        onValueChange={onXAxisChange}
                        className="flex flex-row flex-wrap gap-2"
                    >
                        {columns.map(column => (
                            <div key={`x-${column}`} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                <RadioGroupItem value={column} id={`x-${column}`} />
                                <Label htmlFor={`x-${column}`} className="text-sm whitespace-nowrap">{column}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-2 flex-1">
                    <Label>Y轴（垂直轴）</Label>
                    <RadioGroup
                        value={yAxisColumn}
                        onValueChange={onYAxisChange}
                        className="flex flex-row flex-wrap gap-2"
                    >
                        {columns.map(column => (
                            <div key={`y-${column}`} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                <RadioGroupItem value={column} id={`y-${column}`} />
                                <Label htmlFor={`y-${column}`} className="text-sm whitespace-nowrap">{column}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};

export default AxisSelector; 