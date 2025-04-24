import React, { useState, useEffect } from "react";
import { TransformTabProps } from "./types";
import { Loader2, InfoIcon, EyeIcon, CheckIcon, CircleIcon, X } from "lucide-react";
import { Label } from "@/components/ui/shadcn/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn/radio-group";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { useToast } from "@/utils/hooks/use-toast";
import { Badge } from "@/components/ui/shadcn/badge";
import { Input } from "@/components/ui/shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { cn } from "@/utils/utils";

export function TransformTab({
    file,
    selectedColumn,
    selectedColumns,
    availableColumns,
    setMessage,
    setProcessedFileUrl,
    setCleaned,
    rawFileData
}: TransformTabProps) {
    const { toast } = useToast();
    const [isTransforming, setIsTransforming] = useState<boolean>(false);
    const [transformType, setTransformType] = useState<string>("numeric");
    const [numericOperation, setNumericOperation] = useState<string>("normalize");
    const [textOperation, setTextOperation] = useState<string>("lowercase");
    const [categoricalOperation, setCategoricalOperation] = useState<string>("one-hot");
    const [selectedTransformColumns, setSelectedTransformColumns] = useState<string[]>([]);
    const [customPrefix, setCustomPrefix] = useState<string>("");
    const [customSuffix, setCustomSuffix] = useState<string>("");
    const [minValue, setMinValue] = useState<string>("0");
    const [maxValue, setMaxValue] = useState<string>("1");
    const [selectedRegexColumns, setSelectedRegexColumns] = useState<string[]>([]);
    const [regexPattern, setRegexPattern] = useState<string>("");
    const [regexReplacement, setRegexReplacement] = useState<string>("");

    useEffect(() => {
        // Reset selected columns when transform type changes
        setSelectedTransformColumns([]);
    }, [transformType]);

    const handleTransform = async () => {
        if (!file || !rawFileData) {
            toast({
                title: "错误",
                description: "请先上传并预览文件",
                variant: "destructive"
            });
            return;
        }

        if (selectedTransformColumns.length === 0) {
            toast({
                title: "错误",
                description: "请至少选择一列进行转换",
                variant: "destructive"
            });
            return;
        }

        setIsTransforming(true);

        try {
            // Prepare form data for API call
            const formData = new FormData();
            formData.append("file", file);
            formData.append("columns", JSON.stringify(selectedTransformColumns));
            formData.append("transformType", transformType);

            // Add operation-specific parameters
            if (transformType === "numeric") {
                formData.append("operation", numericOperation);
                if (numericOperation === "scale") {
                    formData.append("minValue", minValue);
                    formData.append("maxValue", maxValue);
                }
            } else if (transformType === "text") {
                formData.append("operation", textOperation);
                if (textOperation === "prefix" || textOperation === "suffix") {
                    formData.append("customText", textOperation === "prefix" ? customPrefix : customSuffix);
                } else if (textOperation === "regex") {
                    formData.append("regexPattern", regexPattern);
                    formData.append("regexReplacement", regexReplacement);
                }
            } else if (transformType === "categorical") {
                formData.append("operation", categoricalOperation);
            }

            // Send request to API
            const response = await fetch("/api/data/transform", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "数据转换失败");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setProcessedFileUrl(url);
            setCleaned(true);
            setMessage("数据转换完成，您可以下载处理后的文件。");

            toast({
                title: "转换成功",
                description: "数据已成功转换",
                variant: "default",
            });
        } catch (error) {
            console.error("数据转换错误:", error);
            toast({
                title: "转换错误",
                description: error instanceof Error ? error.message : "数据转换失败",
                variant: "destructive",
            });
        } finally {
            setIsTransforming(false);
        }
    };

    // If not rawFileData, show prompt info
    if (!rawFileData) {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    数据转换选项
                </h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                    <p className="text-amber-700 dark:text-amber-300">
                        请先预览文件数据，确保原始数据已加载。可能需要切换到文件预览选项卡，然后再回到此页面。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                数据转换选项
            </h4>

            <div className="space-y-4">
                <div className="space-y-3">
                    <Label className="mb-1 block">转换类型:</Label>
                    <Tabs value={transformType} onValueChange={setTransformType} className="w-full">
                        <TabsList className="mb-4 w-full grid grid-cols-3">
                            <TabsTrigger value="numeric">数值转换</TabsTrigger>
                            <TabsTrigger value="text">文本转换</TabsTrigger>
                            <TabsTrigger value="categorical">分类转换</TabsTrigger>
                        </TabsList>

                        <TabsContent value="numeric" className="space-y-4">
                            <div className="space-y-3">
                                <Label className="mb-1 block">数值转换操作:</Label>
                                <RadioGroup
                                    value={numericOperation}
                                    onValueChange={setNumericOperation}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="normalize" id="normalize" />
                                        <Label htmlFor="normalize" className="font-normal cursor-pointer">
                                            标准化 (Z-Score)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="scale" id="scale" />
                                        <Label htmlFor="scale" className="font-normal cursor-pointer">
                                            缩放到指定区间
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="log" id="log" />
                                        <Label htmlFor="log" className="font-normal cursor-pointer">
                                            对数转换
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="square-root" id="square-root" />
                                        <Label htmlFor="square-root" className="font-normal cursor-pointer">
                                            平方根转换
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {numericOperation === "scale" && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="min-value">最小值</Label>
                                            <Input
                                                id="min-value"
                                                type="number"
                                                value={minValue}
                                                onChange={(e) => setMinValue(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max-value">最大值</Label>
                                            <Input
                                                id="max-value"
                                                type="number"
                                                value={maxValue}
                                                onChange={(e) => setMaxValue(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4">
                            <div className="space-y-3">
                                <Label className="mb-1 block">文本转换操作:</Label>
                                <RadioGroup
                                    value={textOperation}
                                    onValueChange={setTextOperation}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="lowercase" id="lowercase" />
                                        <Label htmlFor="lowercase" className="font-normal cursor-pointer">
                                            转为小写
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="uppercase" id="uppercase" />
                                        <Label htmlFor="uppercase" className="font-normal cursor-pointer">
                                            转为大写
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="trim" id="trim" />
                                        <Label htmlFor="trim" className="font-normal cursor-pointer">
                                            去除首尾空格
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="prefix" id="prefix" />
                                        <Label htmlFor="prefix" className="font-normal cursor-pointer">
                                            添加前缀
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="suffix" id="suffix" />
                                        <Label htmlFor="suffix" className="font-normal cursor-pointer">
                                            添加后缀
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="regex" id="regex" />
                                        <Label htmlFor="regex" className="font-normal cursor-pointer">
                                            正则表达式替换
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {textOperation === "prefix" && (
                                    <div className="mt-2 space-y-2">
                                        <Label htmlFor="custom-prefix">自定义前缀</Label>
                                        <Input
                                            id="custom-prefix"
                                            type="text"
                                            value={customPrefix}
                                            onChange={(e) => setCustomPrefix(e.target.value)}
                                            className="w-full"
                                            placeholder="输入要添加的前缀"
                                        />
                                    </div>
                                )}

                                {textOperation === "suffix" && (
                                    <div className="mt-2 space-y-2">
                                        <Label htmlFor="custom-suffix">自定义后缀</Label>
                                        <Input
                                            id="custom-suffix"
                                            type="text"
                                            value={customSuffix}
                                            onChange={(e) => setCustomSuffix(e.target.value)}
                                            className="w-full"
                                            placeholder="输入要添加的后缀"
                                        />
                                    </div>
                                )}

                                {textOperation === "regex" && (
                                    <div className="mt-2 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="regex-pattern">正则表达式模式</Label>
                                            <Input
                                                id="regex-pattern"
                                                type="text"
                                                value={regexPattern}
                                                onChange={(e) => setRegexPattern(e.target.value)}
                                                className="w-full"
                                                placeholder="例如: [0-9]+"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="regex-replacement">替换为</Label>
                                            <Input
                                                id="regex-replacement"
                                                type="text"
                                                value={regexReplacement}
                                                onChange={(e) => setRegexReplacement(e.target.value)}
                                                className="w-full"
                                                placeholder="替换文本"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="categorical" className="space-y-4">
                            <div className="space-y-3">
                                <Label className="mb-1 block">分类数据转换操作:</Label>
                                <RadioGroup
                                    value={categoricalOperation}
                                    onValueChange={setCategoricalOperation}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="one-hot" id="one-hot" />
                                        <Label htmlFor="one-hot" className="font-normal cursor-pointer">
                                            独热编码 (One-Hot)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="label" id="label" />
                                        <Label htmlFor="label" className="font-normal cursor-pointer">
                                            标签编码
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">选择需要转换的列:</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransformColumns([...availableColumns])}
                                className="h-8 px-2 text-xs text-gray-500 hover:text-primary"
                            >
                                <CheckIcon className="h-3.5 w-3.5 mr-1" />
                                全选
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransformColumns([])}
                                className="h-8 px-2 text-xs text-gray-500 hover:text-destructive"
                            >
                                <CircleIcon className="h-3.5 w-3.5 mr-1" />
                                清空
                            </Button>

                            {selectedTransformColumns && selectedTransformColumns.length > 0 && (
                                <Badge variant="secondary" className="h-6 px-2 ml-2">
                                    {selectedTransformColumns.length}/{availableColumns.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3 max-h-[200px] overflow-y-auto p-3 border rounded-md">
                        {availableColumns.map((column) => {
                            const isSelected = selectedTransformColumns && selectedTransformColumns.includes(column);
                            return (
                                <Badge
                                    key={column}
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                        "px-3 py-1 cursor-pointer hover:bg-opacity-80 transition-colors",
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground"
                                    )}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedTransformColumns(
                                                selectedTransformColumns.filter((c) => c !== column)
                                            );
                                        } else {
                                            setSelectedTransformColumns([...selectedTransformColumns || [], column]);
                                        }
                                    }}
                                >
                                    {column}
                                    {isSelected ? (
                                        <X className="ml-1 h-3 w-3" />
                                    ) : (
                                        <CheckIcon className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-50" />
                                    )}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                <div className="text-xs text-gray-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">数据转换说明：</p>
                    <p className="mb-1">
                        {transformType === "numeric" && "数值转换用于处理连续型数值数据，如标准化、缩放等。"}
                        {transformType === "text" && "文本转换用于处理字符串数据，如大小写转换、添加前后缀等。"}
                        {transformType === "categorical" && "分类转换用于将分类数据转换为机器学习算法可用的数值形式。"}
                    </p>
                    <p>
                        {transformType === "numeric" && numericOperation === "normalize" && "标准化将使数据均值为0，标准差为1，适用于正态分布的数据。"}
                        {transformType === "numeric" && numericOperation === "scale" && "缩放转换将数据线性映射到指定的区间内。"}
                        {transformType === "numeric" && numericOperation === "log" && "对数转换适用于处理偏态分布数据，可以降低异常值的影响。"}
                        {transformType === "numeric" && numericOperation === "square-root" && "平方根转换适用于中等偏态分布数据，可以减小高值的权重。"}

                        {transformType === "text" && (textOperation === "lowercase" || textOperation === "uppercase") && "大小写转换可以标准化文本，使分析更一致。"}
                        {transformType === "text" && textOperation === "trim" && "去除首尾空格可以清理文本数据，避免因空格造成的不一致性。"}
                        {transformType === "text" && (textOperation === "prefix" || textOperation === "suffix") && "添加前后缀可以用于标识处理过的数据或添加单位等。"}
                        {transformType === "text" && textOperation === "regex" && "正则表达式替换可以用于复杂的文本模式匹配和替换，非常灵活。"}

                        {transformType === "categorical" && categoricalOperation === "one-hot" && "独热编码将每个分类值转换为一个新的二元特征列，适用于名义变量。"}
                        {transformType === "categorical" && categoricalOperation === "label" && "标签编码将分类值映射为整数，适用于序数变量。"}
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleTransform}
                        disabled={isTransforming || !selectedTransformColumns || selectedTransformColumns.length === 0}
                    >
                        {isTransforming ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                转换中...
                            </>
                        ) : (
                            <>应用转换</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
} 