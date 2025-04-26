import { NextRequest, NextResponse } from "next/server";

// todo: 内存中简单存储（仅用于演示，生产环境应使用数据库或缓存）
let parsedFileData: { headers: string[]; rows: string[][] } | null = null;

// 用于前端上传后设置解析结果的辅助API（可选，实际生产建议用更安全方式）
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // 期望 body: { headers: string[], rows: string[][] }
        if (!body.headers || !Array.isArray(body.headers) || !body.rows || !Array.isArray(body.rows)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        parsedFileData = { headers: body.headers, rows: body.rows };
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

// 获取已上传并解析的文件信息
export async function GET() {
    if (!parsedFileData) {
        return NextResponse.json({ error: "No file data available" }, { status: 404 });
    }
    return NextResponse.json(parsedFileData);
} 