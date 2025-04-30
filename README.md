# 社慧 - 智能数据分析与聊天平台

## 安装与部署

1. 安装依赖
```bash
bun install
```

2. 开发环境运行
```bash
bun run dev
```

3. 生产环境构建与启动
```bash
bun run build
bun run start
```

## 项目结构

```
utelligence
  ├─ public/                # 静态资源文件
  ├─ src/                   # 源代码目录
  │   ├─ app/              # Next.js App Router 目录
  │   │   ├─ api/          # API 路由
  │   │   │   ├─ chat/     # 聊天相关 API
  │   │   │   └─ data/     # 数据处理相关 API
  │   │   ├─ chats/        # 聊天页面
  │   │   └─ ...           # 其他页面
  │   ├─ components/       # 组件库
  │   │   ├─ chat/         # 聊天相关组件
  │   │   ├─ constants/    # 常量定义
  │   │   ├─ data-visualization/ # 数据可视化组件
  │   │   │   ├─ charts/             # 图表组件
  │   │   │   ├─ data-cleaning/      # 数据清洗组件
  │   │   │   ├─ file-upload/        # 文件上传组件
  │   │   │   └─ statistical-analysis/ # 统计分析组件
  │   │   ├─ settings/     # 设置相关组件
  │   │   └─ ui/           # UI 基础组件
  │   ├─ store/            # 状态管理
  │   ├─ types/            # TypeScript 类型定义
  │   └─ utils/            # 工具函数
  │       ├─ chat/         # 聊天相关工具
  │       ├─ data/         # 数据处理工具
  │       ├─ hooks/        # React Hooks
  │       └─ mastra/       # AI 集成工具
  ├─ .gitignore            # Git 忽略文件
  ├─ .npmrc                # NPM 配置
  ├─ biome.json            # Biome 配置
  ├─ bun.lock              # Bun 锁定文件
  ├─ components.json       # 组件配置
  ├─ next.config.mjs       # Next.js 配置
  ├─ package.json          # 项目依赖和脚本
  ├─ postcss.config.js     # PostCSS 配置
  ├─ README.md             # 项目说明文档
  └─ tsconfig.json         # TypeScript 配置
```

### 目录说明

- **app/**: 采用 Next.js App Router 架构的页面和 API 路由
  - **api/**: 后端 API 接口
    - **chat/**: 聊天相关 API
    - **data/**: 数据处理 API，包括数据上传、转换、异常值检测等
  - **chats/**: 聊天页面，包含动态路由

- **components/**: 组件库
  - **chat/**: 聊天界面组件
  - **data-visualization/**: 数据可视化组件
    - **charts/**: 各类图表组件
    - **data-cleaning/**: 数据清洗组件
    - **file-upload/**: 文件上传组件
    - **statistical-analysis/**: 统计分析组件
  - **ui/**: UI 基础组件，包含 shadcn UI 扩展

- **store/**: 应用状态管理，使用 Zustand

- **utils/**: 工具函数
  - **chat/**: 聊天相关工具函数
  - **data/**: 数据处理工具
  - **hooks/**: 自定义 React Hooks
  - **mastra/**: Mastra AI 集成工具