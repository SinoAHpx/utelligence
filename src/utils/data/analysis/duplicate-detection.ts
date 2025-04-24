import { useDuplicatesStore } from "@/store/duplicates-store";

/**
 * 检测数据中的重复行
 * @param data 要分析的数据
 * @param columnsToCheck 用于判断重复的列
 */
export function detectDuplicates(
    data: any[],
    columnsToCheck: string[]
) {
    if (!data || !data.length || !columnsToCheck.length) {
        return {
            duplicateGroups: [],
            statistics: {
                totalRows: 0,
                uniqueRows: 0,
                duplicateRows: 0,
                duplicateGroupsCount: 0,
                duplicateCount: 0,
            },
        };
    }

    const totalRows = data.length;
    const keyMap = new Map<string, number[]>();

    // 为每行生成唯一键并分组
    data.forEach((row, index) => {
        // 提取指定列的值作为键
        const keyParts = columnsToCheck.map((col) => {
            const val = row[col];
            // 处理特殊值，避免 undefined、null 等导致的问题
            return val === undefined || val === null ? "" : String(val).trim();
        });

        const key = keyParts.join("||");

        // 添加到映射中
        if (!keyMap.has(key)) {
            keyMap.set(key, []);
        }
        keyMap.get(key)!.push(index);
    });

    // 只保留有重复的组
    const duplicateGroups = Array.from(keyMap.entries())
        .filter(([_, indices]) => indices.length > 1)
        .map(([key, indices]) => ({
            key,
            indices,
            rows: indices.map((idx) => ({ ...data[idx], _index: idx })),
            count: indices.length,
        }));

    // 计算统计信息
    const duplicateGroupsCount = duplicateGroups.length;
    const duplicateCount = duplicateGroups.reduce(
        (count, group) => count + group.count,
        0
    ) - duplicateGroupsCount; // 减去每组的第一行，因为它不算重复
    const uniqueRows = totalRows - duplicateCount;

    // 返回结果
    return {
        duplicateGroups,
        statistics: {
            totalRows,
            uniqueRows,
            duplicateRows: duplicateCount,
            duplicateGroupsCount,
            duplicateCount,
        },
    };
}

/**
 * 使用 Zustand store 执行重复数据检测
 */
export function detectDuplicatesWithStore(
    data: any[],
    columnsToCheck: string[]
) {
    const store = useDuplicatesStore.getState();

    const { duplicateGroups, statistics } = detectDuplicates(data, columnsToCheck);

    // 更新 store
    store.setData(data);
    store.setSelectedColumns(columnsToCheck);
    store.setDuplicateGroups(duplicateGroups);
    store.setStatistics(statistics);

    return { duplicateGroups, statistics };
} 