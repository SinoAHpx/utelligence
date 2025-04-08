import React from "react";
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
    return (
        <div className="space-y-3 border-t pt-3 mt-2">
            <h4 className="text-sm font-medium">设置坐标轴</h4>

            <div className="space-y-2">
                <Label>X轴（水平轴）</Label>
                <RadioGroup
                    value={xAxisColumn}
                    onValueChange={onXAxisChange}
                    className="flex flex-col space-y-1"
                >
                    {columns.map(column => (
                        <div key={`x-${column}`} className="flex items-center space-x-2">
                            <RadioGroupItem value={column} id={`x-${column}`} />
                            <Label htmlFor={`x-${column}`}>{column}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label>Y轴（垂直轴）</Label>
                <RadioGroup
                    value={yAxisColumn}
                    onValueChange={onYAxisChange}
                    className="flex flex-col space-y-1"
                >
                    {columns.map(column => (
                        <div key={`y-${column}`} className="flex items-center space-x-2">
                            <RadioGroupItem value={column} id={`y-${column}`} />
                            <Label htmlFor={`y-${column}`}>{column}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
};

export default AxisSelector; 