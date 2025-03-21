"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataDisplay from "@/components/data-visualization/data-display";
import DataCleaning from "@/components/data-visualization/data-cleaning";
import DataAnalysis from "@/components/data-visualization/data-analysis";

interface DataTabsProps {
    file: File | null;
}

export default function DataTabs({ file }: DataTabsProps) {
    const [activeTab, setActiveTab] = useState("display");

    return (
        <div className="w-full h-full">
            <Tabs
                defaultValue="display"
                className="w-full h-full flex flex-col"
                onValueChange={setActiveTab}
            >
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="display">数据展示</TabsTrigger>
                    <TabsTrigger value="cleaning">数据清洗</TabsTrigger>
                    <TabsTrigger value="analysis">数据分析</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto">
                    <TabsContent value="display" className="h-full">
                        <DataDisplay file={file} />
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
