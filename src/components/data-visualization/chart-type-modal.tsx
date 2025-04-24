"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { X } from "lucide-react";
import { CHART_TYPES } from "@/types/chart-types";

// Chart type icons mapping
const CHART_ICONS: Record<string, string> = {
  bar: "📊",
  line: "📈",
  area: "🌊",
  pie: "🥧",
  scatter: "✨",
  radar: "🔄",
};

interface ChartTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (chartType: string) => void;
}

/**
 * Chart type selection modal
 * Allows users to select from available chart types
 */
export default function ChartTypeModal({
  open,
  onOpenChange,
  onSelect,
}: ChartTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("bar");

  const handleSelect = () => {
    onSelect(selectedType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>选择图表类型</DialogTitle>
          <DialogDescription>
            请选择您想要使用的图表类型来可视化已选择的数据列
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-6">
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${selectedType === type.id
                ? "border-primary bg-primary/10 dark:bg-primary/20"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <span className="text-2xl mb-2">{CHART_ICONS[type.id]}</span>
              <span
                className={`text-sm font-medium ${selectedType === type.id
                  ? "text-primary dark:text-primary"
                  : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                {type.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">{type.description}</span>
              {type.colorDescription && (
                <div className="mt-2 text-xs" dangerouslySetInnerHTML={{ __html: type.colorDescription }} />
              )}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSelect}>
            选择并继续
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
