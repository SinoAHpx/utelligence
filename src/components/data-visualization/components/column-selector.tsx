import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColumnVisualizableConfig } from "@/store/dataVisualizationStore";

interface ColumnSelectorProps {
    columns: string[];
    selectedColumns: string[];
    onColumnToggle: (column: string) => void;
    maxColumns?: number;
    columnsVisualizableStatus?: ColumnVisualizableConfig[];
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
    columns,
    selectedColumns,
    onColumnToggle,
    maxColumns = 2,
    columnsVisualizableStatus = [],
}) => {
    return (
        <div className="max-h-32 sm:max-h-24 overflow-auto border rounded-md p-3 space-y-2">
            {columns.map((column) => {
                const colStatus = columnsVisualizableStatus.find(s => s.column === column);
                const isVisualizable = colStatus ? colStatus.isVisualizable : true;

                return (
                    <div key={column} className="flex items-center space-x-2">
                        <Checkbox
                            id={`column-${column}`}
                            checked={selectedColumns.includes(column)}
                            onCheckedChange={() => onColumnToggle(column)}
                            disabled={!isVisualizable || (selectedColumns.length >= maxColumns && !selectedColumns.includes(column))}
                        />
                        <Label
                            htmlFor={`column-${column}`}
                            className={`cursor-pointer flex items-center ${!isVisualizable ? 'text-gray-400' : ''}`}
                        >
                            {column}
                            {!isVisualizable && colStatus?.reason && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle size={14} className="ml-1 text-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{colStatus.reason}</p>
                                            <p className="text-xs mt-1">唯一值: {colStatus.uniqueValues}/{colStatus.totalValues}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </Label>
                    </div>
                );
            })}
        </div>
    );
};

export default ColumnSelector; 