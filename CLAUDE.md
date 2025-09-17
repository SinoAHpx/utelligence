# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management & Development
```bash
# Install dependencies
bun install

# Start development server (with Turbopack)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

### Environment Setup
Create `.env.local` based on `.env.example`:
- `URL`: API endpoint URL
- `API_KEY`: Authentication key for external services
- `MODEL`: AI model identifier

## Code Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Edge Runtime
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand stores
- **AI Integration**: Mastra framework with custom agents
- **Data Processing**: Custom data analysis and visualization pipeline
- **Code Quality**: Biome for linting and formatting

### Key Architecture Patterns

#### State Management (Zustand)
The application uses a unified state management approach:
- **unified-data-store.ts**: Central data store for file uploads, processing, and analysis
- **chat-store.ts**: Chat-specific state management
- **visualization-chart-store.ts**: Chart and visualization state
- **compatibility-layer.ts**: Backwards compatibility for legacy stores (being phased out)

#### Data Processing Pipeline
Located in `src/app/api/data/`, the API routes handle:
- File upload and parsing (`upload/route.ts`)
- Data transformation (`transform/route.ts`)
- Missing value detection (`missing/route.ts`)
- Duplicate detection (`duplicates/route.ts`)
- Outlier detection (`outliers/route.ts`)
- Shared data processing utilities (`utils/data-processor.ts`)

#### Component Organization
- **UI Components**: `src/components/ui/shadcn/` - shadcn/ui components
- **Chat Components**: `src/components/chat/` - Chat interface and messaging
- **Data Visualization**: `src/components/data-visualization/` - Charts, analysis, and data cleaning
  - `charts/` - Recharts-based visualization components
  - `data-cleaning/` - Data cleaning and preprocessing tools
  - `statistical-analysis/` - Statistical analysis components
  - `file-upload/` - File upload and preview components

#### AI Integration (Mastra)
- **Mastra Instance**: `src/utils/mastra/index.ts` - Central Mastra configuration
- **Agents**: `src/utils/mastra/agents/` - AI agents for data analysis
- **Tools**: `src/utils/mastra/tools/` - Custom tools for AI interactions
- **Providers**: `src/utils/mastra/providers/` - Custom AI providers (Volcano Engine)

### Code Style & Standards

#### Formatting (Biome Configuration)
- **Indentation**: Tabs, 2-width
- **Line Length**: 100 characters
- **Quotes**: Double quotes for JS/TS, JSX
- **Semicolons**: Always required
- **Trailing Commas**: ES5 style

#### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- Target: ES2017
- Next.js plugin enabled

#### Import Organization
- Biome auto-organizes imports
- Use absolute imports with `@/` prefix for src directory

### Data Flow Architecture

#### File Upload → Processing → Visualization
1. **Upload**: Files processed via `/api/data/upload`
2. **Analysis**: Data sent through processing pipeline
3. **Storage**: Results stored in unified data store
4. **Visualization**: Components render charts and analysis from store
5. **Chat Integration**: AI agents can analyze data and generate insights

#### State Updates
- File data flows through `unified-data-store`
- Chart configurations managed in `visualization-chart-store`
- Chat messages and AI responses in `chat-store`
- Legacy stores (in `compatibility-layer`) being deprecated

### Testing & Quality Assurance
- Use `bun run lint` to check code quality with Biome
- No test framework currently configured - add tests as needed
- Edge runtime used for API routes for better performance

### Key Utilities
- **Statistics**: `src/utils/data/statistics/` - Mathematical analysis functions
- **Data Processing**: `src/utils/data/data-processing.ts` - Core data manipulation
- **Chart Helpers**: `src/utils/data/visualization/` - Chart configuration and colors
- **Hooks**: `src/utils/hooks/` - Custom React hooks (mobile detection, toast)

### Development Notes
- The application supports both Chinese and English interfaces
- Uses Next.js standalone output for deployment
- Mastra packages are externalized in server configuration
- Theme provider supports light/dark mode switching