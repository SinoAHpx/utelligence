# nextjs-vllm-ui-revival

## 项目概述

本项目为大型语言模型（LLM）提供了一个完整的本地 Web 界面，技术实现完全基于 Next.js 框架，专为高性能和易用性而设计。

## 技术栈详解

- **前端框架**：[Next.js](https://nextjs.org/) 15.2.3 - 采用 React 19.0.0 构建的现代 Web 应用框架
- **UI 组件**：[shadcn-ui](https://ui.shadcn.com/) - 基于 Radix UI 和 TailwindCSS 构建的高可定制组件库
- **样式系统**：[TailwindCSS](https://tailwindcss.com/) 4.0.17 - 原子化 CSS 框架实现高效样式开发
- **状态管理**：[Zustand](https://github.com/pmndrs/zustand) 5.0.3 - 轻量级状态管理库
- **本地存储**：使用 `use-local-storage-state` 实现聊天历史持久化
- **代码高亮**：集成 `react-syntax-highlighter` 实现代码块语法高亮
- **Markdown 渲染**：使用 `react-markdown` 和 `remark-gfm` 实现富文本展示
- **聊天组件**：[shadcn-chat](https://github.com/jakobhoeg/shadcn-chat) - 专为 NextJS 设计的聊天组件

## 核心技术实现

### API 集成

```typescript
// vLLM API 集成配置
VLLM_URL="http://localhost:8000"  // vLLM 服务器地址
VLLM_API_KEY="your-api-key"       // API 密钥（如需）
VLLM_MODEL="llama3:8b"            // 默认模型
VLLM_TOKEN_LIMIT=4096             // 最大 token 限制
```

### 容器化部署

Dockerfile 采用多阶段构建策略，优化了镜像大小和构建过程：

```dockerfile
# 构建阶段
FROM node:lts-alpine AS builder
WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 生产阶段 
FROM node:lts-alpine AS runner
ENV NODE_ENV production
# 利用 Next.js 输出追踪优化镜像大小
COPY --from=builder --chown=nextjs:nodejs /opt/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /opt/app/.next/static ./.next/static
```

### 项目结构

```
src/
├── app/           # Next.js 应用路由及页面组件
├── components/    # UI 组件库
├── hooks/         # 自定义 React Hooks
├── lib/           # 核心库函数
├── store/         # Zustand 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
└── providers/     # React Context Providers
```

## 技术特性

- **流式响应**：使用 AI SDK 实现流式文本生成
- **完全响应式**：适配各种设备尺寸
- **本地存储**：使用浏览器 localStorage 存储聊天历史，无需数据库
- **主题系统**：基于 `next-themes` 实现的明/暗模式切换
- **系统提示持久化**：每个对话可保存自定义系统提示词
- **代码处理**：集成代码高亮与一键复制功能
- **动态 UI**：使用 Radix UI 实现高度可访问的界面组件

## 环境要求

- **Node.js**: v18+ (推荐使用最新 LTS 版本)
- **vLLM/Ollama**: 运行中的 vLLM 或 Ollama 实例
- **构建工具**: 支持 yarn/npm/bun

## 快速开始

### Docker 部署 (推荐)

```bash
# 使用 vLLM 后端
docker run --rm -d -p 3000:3000 -e VLLM_URL=http://host.docker.internal:8000 ghcr.io/yoziru/nextjs-vllm-ui:latest

# 使用 Ollama 后端
docker run --rm -d -p 3000:3000 -e VLLM_URL=http://host.docker.internal:11434 -e VLLM_TOKEN_LIMIT=8192 -e VLLM_MODEL=llama3 ghcr.io/yoziru/nextjs-vllm-ui:latest
```

### 本地开发

```bash
# 克隆代码库
git clone https://github.com/yoziru/nextjs-vllm-ui

# 安装依赖
cd nextjs-vllm-ui
bun install

# 配置环境变量
cp .example.env .env

# 启动开发服务器
bun run dev

# 访问 http://localhost:3000 开始使用
```

### 自定义 Docker 构建

```bash
docker build . -t ghcr.io/yoziru/nextjs-vllm-ui:latest \
 && docker run --rm \
  -p 3000:3000 \
  -e VLLM_URL=http://host.docker.internal:11434 \
  -e VLLM_MODEL=llama3.1:8b-instruct-q8_0 \
  -e NEXT_PUBLIC_TOKEN_LIMIT="8192" \
  ghcr.io/yoziru/nextjs-vllm-ui:latest
```
