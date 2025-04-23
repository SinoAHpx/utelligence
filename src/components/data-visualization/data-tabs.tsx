"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataDisplay from "@/components/data-visualization/data-display";
import DataCleaning from "@/components/data-visualization/data-cleaning/DataCleaning";
import DataAnalysis from "@/components/data-visualization/data-analysis";
import FilePreview from "@/components/data-visualization/file-preview";

interface DataTabsProps {
  file: File | null;
}

export default function DataTabs({ file }: DataTabsProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // 处理从FilePreview获取的列信息
  const handleColumnsAvailable = React.useCallback(
    (columns: string[]) => {
      if (columns.length > 0) {
        // 只在初始加载时设置可用列，避免重复更新
        if (availableColumns.length === 0) {
          setAvailableColumns(columns);
        }

        // 如果还没有选择列，则将传入的列设为已选择
        if (selectedColumns.length === 0) {
          setSelectedColumns(columns);
          // 当首次获取列数据时，自动切换到"数据展示"选项卡
          setActiveTab("display");
        }
      }
    },
    [availableColumns.length, selectedColumns.length]
  );

  // 当文件变更时，重置到预览标签
  useEffect(() => {
    if (file) {
      setActiveTab("preview");
    }
  }, [file]);

  // 监听可视化事件
  useEffect(() => {
    const handleVisualize = (e: Event) => {
      // 如果是自定义事件，尝试从detail中获取选择的列
      if (e instanceof CustomEvent && e.detail && e.detail.columns) {
        const newSelectedColumns = e.detail.columns;
        // 只有当选择的列发生变化时才更新
        if (
          JSON.stringify(newSelectedColumns) !== JSON.stringify(selectedColumns)
        ) {
          setSelectedColumns(newSelectedColumns);
        }
      }

      // 直接切换到数据展示标签页
      setActiveTab("display");
    };

    window.addEventListener("visualize", handleVisualize as EventListener);

    return () => {
      window.removeEventListener("visualize", handleVisualize as EventListener);
    };
  }, [selectedColumns]);

  // 处理列选择变化
  const handleColumnSelectionChange = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  return (
    <div className="w-full h-full">
      <Tabs
        value={activeTab}
        className="w-full h-full flex flex-col"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="preview">文件预览</TabsTrigger>
          <TabsTrigger value="display">数据展示</TabsTrigger>
          <TabsTrigger value="analysis">数据分析</TabsTrigger>
          <TabsTrigger value="cleaning">数据清洗</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="preview" className="h-full">
            <FilePreview
              file={file}
              maxRows={30}
              onColumnsAvailable={handleColumnsAvailable}
            />
          </TabsContent>

          <TabsContent value="display" className="h-full">
            <DataDisplay
              file={file}
              selectedColumns={selectedColumns}
              availableColumns={availableColumns}
              onColumnSelectionChange={handleColumnSelectionChange}
            />
          </TabsContent>

          <TabsContent value="cleaning" className="h-full">
            <DataCleaning
              file={file}
              selectedColumns={selectedColumns}
              availableColumns={availableColumns}
            />
          </TabsContent>

          <TabsContent value="analysis" className="h-full">
            <DataAnalysis
              file={file}
              selectedColumns={selectedColumns}
              availableColumns={availableColumns}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
