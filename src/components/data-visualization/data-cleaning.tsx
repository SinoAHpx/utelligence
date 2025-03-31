"use client";

import React, { useState } from "react";

interface DataCleaningProps {
  file: File | null;
  selectedColumns: string[];
  availableColumns: string[];
}

export default function DataCleaning({
  file,
  selectedColumns,
  availableColumns,
}: DataCleaningProps) {
  const [activeTab, setActiveTab] = useState<string>("missing");
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [cleaned, setCleaned] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const tabs = [
    { id: "missing", name: "缺失值处理" },
    { id: "outliers", name: "异常值处理" },
    { id: "duplicates", name: "重复数据" },
    { id: "transform", name: "数据转换" },
  ];

  const handleClean = () => {
    setIsCleaning(true);
    setMessage("");

    // Simulate cleaning process
    setTimeout(() => {
      setIsCleaning(false);
      setCleaned(true);
      setMessage("数据清洗完成");
    }, 1500);
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">请先上传文件</p>
      </div>
    );
  }

  if (selectedColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          请先在文件预览选项卡中选择至少一列数据
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            文件: <span className="font-bold">{file.name}</span>
          </h3>
          <button
            onClick={handleClean}
            disabled={isCleaning}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isCleaning
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCleaning ? "处理中..." : "执行清洗"}
          </button>
        </div>

        {message && (
          <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-md">
            {message}
          </div>
        )}

        <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "missing" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                缺失值处理选项
              </h4>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="remove-rows"
                    name="missing-option"
                    className="mr-2"
                    defaultChecked
                  />
                  <label
                    htmlFor="remove-rows"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    删除包含缺失值的行
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="fill-mean"
                    name="missing-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="fill-mean"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    使用均值填充缺失值
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="fill-median"
                    name="missing-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="fill-median"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    使用中位数填充缺失值
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="fill-mode"
                    name="missing-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="fill-mode"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    使用众数填充缺失值
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="fill-custom"
                    name="missing-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="fill-custom"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    使用自定义值填充
                  </label>
                  <input
                    type="text"
                    className="ml-2 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="自定义值"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "outliers" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                异常值处理选项
              </h4>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="remove-outliers"
                    name="outlier-option"
                    className="mr-2"
                    defaultChecked
                  />
                  <label
                    htmlFor="remove-outliers"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    移除异常值
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cap-outliers"
                    name="outlier-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="cap-outliers"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    截断异常值（使用分位数）
                  </label>
                </div>

                <div>
                  <div className="flex items-center mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                      检测方法:
                    </span>
                    <select className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                      <option value="zscore">Z-Score</option>
                      <option value="iqr">IQR（四分位数）</option>
                      <option value="percentile">百分位数</option>
                    </select>
                  </div>

                  <div className="flex items-center mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                      阈值:
                    </span>
                    <input
                      type="number"
                      className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-20"
                      defaultValue="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "duplicates" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                重复数据处理选项
              </h4>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="remove-all"
                    name="duplicate-option"
                    className="mr-2"
                    defaultChecked
                  />
                  <label
                    htmlFor="remove-all"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    删除所有重复行，只保留第一条
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="remove-by-cols"
                    name="duplicate-option"
                    className="mr-2"
                  />
                  <label
                    htmlFor="remove-by-cols"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    基于特定列删除重复项
                  </label>
                </div>

                <div className="mt-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                      选择列:
                    </span>
                    <select className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                      <option value="id">ID</option>
                      <option value="name">名称</option>
                      <option value="date">日期</option>
                    </select>
                    <button className="ml-2 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                      添加
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded flex items-center">
                      ID
                      <button className="ml-1 text-blue-500 dark:text-blue-400">
                        ×
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transform" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                数据转换选项
              </h4>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="normalize" className="mr-2" />
                  <label
                    htmlFor="normalize"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    数据标准化（均值为0，标准差为1）
                  </label>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="minmax" className="mr-2" />
                  <label
                    htmlFor="minmax"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    最小-最大缩放（0-1范围）
                  </label>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="log" className="mr-2" />
                  <label
                    htmlFor="log"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    对数转换
                  </label>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="onehot" className="mr-2" />
                  <label
                    htmlFor="onehot"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    独热编码（分类变量）
                  </label>
                </div>

                <div className="mt-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                      应用到列:
                    </span>
                    <select className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                      <option value="all">所有数值列</option>
                      <option value="col1">列 1</option>
                      <option value="col2">列 2</option>
                      <option value="col3">列 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
