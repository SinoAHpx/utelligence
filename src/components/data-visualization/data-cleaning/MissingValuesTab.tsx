import React from "react";
import { MissingValuesTabProps } from "./types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export function MissingValuesTab({
    missingOption,
    setMissingOption,
    customValue,
    setCustomValue
}: MissingValuesTabProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                缺失值处理选项
            </h4>

            <RadioGroup
                value={missingOption}
                onValueChange={setMissingOption}
                className="space-y-2"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remove-rows" id="remove-rows" />
                    <Label htmlFor="remove-rows">删除包含缺失值的行</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill-mean" id="fill-mean" />
                    <Label htmlFor="fill-mean">使用均值填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill-median" id="fill-median" />
                    <Label htmlFor="fill-median">使用中位数填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill-mode" id="fill-mode" />
                    <Label htmlFor="fill-mode">使用众数填充缺失值</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill-custom" id="fill-custom" />
                    <Label htmlFor="fill-custom">使用自定义值填充</Label>
                    <Input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        className="ml-2 w-40"
                        placeholder="自定义值"
                        disabled={missingOption !== "fill-custom"}
                    />
                </div>
            </RadioGroup>
        </div>
    );
} 