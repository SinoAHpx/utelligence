"use client";

import React, { useState } from "react";

// 定义图表类型选项
const chartTypes = [
  { id: "bar", name: "柱状图", icon: "📊" },
  { id: "line", name: "线形图", icon: "📈" },
  { id: "area", name: "面积图", icon: "🌊" },
  { id: "pie", name: "饼图", icon: "🥧" },
  { id: "scatter", name: "散点图", icon: "✨" },
  { id: "radar", name: "雷达图", icon: "🔄" },
];

interface ChartTypeModalProps {
  onClose: () => void;
  onSelect: (chartType: string) => void;
}

export default function ChartTypeModal({
  onClose,
  onSelect,
}: ChartTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("bar");

  const handleSelect = () => {
    onSelect(selectedType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            选择图表类型
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          请选择您想要使用的图表类型来可视化已选择的数据列
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                selectedType === type.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-2xl mb-2">{type.icon}</span>
              <span
                className={`text-sm font-medium ${
                  selectedType === type.id
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {type.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            选择并继续
          </button>
        </div>
      </div>
    </div>
  );
}
