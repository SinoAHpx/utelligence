"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import DataDisplay from "@/components/data-visualization/data-display";
import DataCleaning from "@/components/data-visualization/data-cleaning/DataCleaning";
import DataAnalysis from "@/components/data-visualization/data-analysis";
import FilePreview from "@/components/data-visualization/file-upload/file-preview";
import { useFileUploadStore } from "@/store/fileUploadStore";

interface DataTabsProps {
  file: File | null;
}

export default function DataTabs({ file }: DataTabsProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const { setFile, processFile } = useFileUploadStore();

  // Initialize file in the store when it changes
  useEffect(() => {
    if (file) {
      setFile(file);
      processFile(file, 30);
    }
  }, [file, setFile, processFile]);

  // 当文件变更时，重置到预览标签
  useEffect(() => {
    if (file) {
      setActiveTab("preview");
    }
  }, [file]);

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
            <FilePreview />
          </TabsContent>

          <TabsContent value="display" className="h-full">
            <DataDisplay />
          </TabsContent>

          <TabsContent value="cleaning" className="h-full">
            <DataCleaning file={file} />
          </TabsContent>

          <TabsContent value="analysis" className="h-full">
            <DataAnalysis file={file} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
