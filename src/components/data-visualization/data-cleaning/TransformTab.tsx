import React from "react";
import { TransformTabProps } from "./types";

export function TransformTab({ }: TransformTabProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                数据转换选项
            </h4>

            <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 dark:text-gray-400">
                    功能开发中，敬请期待...
                </p>
            </div>
        </div>
    );
} 