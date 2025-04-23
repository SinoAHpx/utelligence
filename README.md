# Next.js vLLM UI

A modern web interface for interacting with large language models (LLMs) through vLLM or Ollama, built with Next.js and React.

## Project Structure

### Root Configuration Files

- **package.json**: Defines project dependencies including Next.js 15.2.3, React 19, shadcn UI components, data visualization libraries like Recharts, state management with Zustand, and various utility packages
- **next.config.mjs**: Next.js configuration settings for build optimization, environment variables, and deployment options
- **tsconfig.json**: TypeScript compiler configuration with path aliases and strict type checking
- **biome.json**: Configuration for the Biome linter/formatter with project-specific rules
- **.env**: Environment variables for development containing API endpoints and configuration
- **.env.development**: Development-specific environment variables
- **Dockerfile**: Multi-stage build configuration for containerized deployment with optimized image size
- **postcss.config.js**: PostCSS configuration for processing CSS with Tailwind
- **components.json**: Configuration for shadcn UI components
- **bun.lock**: Dependency lock file for Bun package manager
- **Makefile**: Build and deployment automation commands

### Source Code Organization (`src/`)

#### App Structure (`src/app/`)

- **layout.tsx**: Root layout component that wraps all pages with global providers and layout structure
- **page.tsx**: Main application page component that renders the chat interface and data panel in a responsive layout
- **globals.css**: Global CSS styles including Tailwind directives and custom CSS variables
- **favicon.ico**: Site favicon displayed in browser tabs

#### API Routes (`src/app/api/`)

- **chat/route.ts**: Handles chat completion requests to LLM backends with token management and streaming responses
- **models/route.ts**: Retrieves available models from the connected LLM service
- **settings/route.ts**: Manages application settings for persistence
- **health/route.ts**: Health check endpoint for monitoring service availability
- **agent/stream/route.ts**: Streaming API for agent interactions with specialized capabilities

**Data API Routes (`src/app/api/data/`):**
- **upload/route.ts**: Handles file uploads with validation and storage
- **transform/route.ts**: Data transformation endpoint for pre-processing operations
- **missing/route.ts**: Detects and reports missing values in datasets
- **outliers/route.ts**: Identifies statistical outliers using various detection methods
- **duplicates/route.ts**: Finds duplicate records in datasets for data cleaning

#### Chat Components (`src/components/chat/`)

- **chat-page.tsx**: Main chat interface container that orchestrates chat functionality
- **chat.tsx**: Core chat functionality wrapper that handles message rendering and state
- **chat-layout.tsx**: Layout structure for the chat interface with header, body, and input areas
- **chat-bottombar.tsx**: Input area with message sending functionality, typing indicators, and options
- **chat-topbar.tsx**: Navigation and options in the chat header including model selection and settings
- **message-item.tsx**: Individual message display component with formatting and interaction options
- **message-formatter.tsx**: Formats different message content types including markdown and code
- **chat-list.tsx**: Displays list of chat conversations with titles and timestamps
- **empty-state.tsx**: Placeholder component displayed when no chat history exists
- **chat-options.ts**: Type definitions for chat configuration options and parameters

#### UI Components (`src/components/ui/`)

- **accordion.tsx**: Collapsible content panels for organizing information
- **alert-dialog.tsx**: Modal dialog for critical confirmations with accessibility features
- **alert.tsx**: Contextual feedback messages in various states (error, warning, success)
- **aspect-ratio.tsx**: Container maintaining specific width/height ratio
- **avatar.tsx**: User or entity representation with image and fallback options
- **badge.tsx**: Small visual indicators for statuses, counts, or categories
- **breadcrumb.tsx**: Navigation path indicator showing hierarchy
- **button.tsx**: Multi-variant button component with different styles and states
- **calendar.tsx**: Date selection component with month navigation
- **card.tsx**: Container component for grouping related content
- **carousel.tsx**: Slideshow component for cycling through content
- **chart.tsx**: Base chart component with configuration options
- **checkbox.tsx**: Selection control for boolean input
- **collapsible.tsx**: Toggle visibility component for hiding/showing content
- **command.tsx**: Command palette for keyboard-driven interfaces
- **context-menu.tsx**: Right-click menu with multiple action options
- **dialog.tsx**: Modal overlay for focused interactions
- **drawer.tsx**: Slide-in panel from screen edge
- **dropdown-menu.tsx**: Contextual floating menu with nested options
- **form.tsx**: Form handling with validation and submission
- **hover-card.tsx**: Rich content preview on hover
- **input.tsx**: Text input field with various states
- **input-otp.tsx**: One-time password input with separate character fields
- **label.tsx**: Form label with accessibility features
- **menubar.tsx**: Horizontal menu with dropdowns and keyboard navigation
- **navigation-menu.tsx**: Main site navigation with dropdown capabilities
- **pagination.tsx**: Controls for navigating through multi-page content
- **popover.tsx**: Floating content triggered by user interaction
- **progress.tsx**: Visual indicator of completion percentage
- **radio-group.tsx**: Selection control for mutually exclusive options
- **resizable.tsx**: Panels that can be resized by dragging
- **scroll-area.tsx**: Custom scrolling container with consistent styling
- **select.tsx**: Dropdown selection control with search capabilities
- **separator.tsx**: Visual divider between content sections
- **sheet.tsx**: Modal side panel with various entry positions
- **sidebar.tsx**: Navigation sidebar with collapsible sections
- **skeleton.tsx**: Loading placeholder for content
- **slider.tsx**: Range selection component
- **sonner.tsx**: Toast notification wrapper for Sonner library
- **switch.tsx**: Toggle switch for boolean settings
- **table.tsx**: Data table with sorting and selection
- **tabs.tsx**: Content organization with tabbed interface
- **textarea.tsx**: Multi-line text input with auto-resize
- **toast.tsx**: Notification component with various states
- **toaster.tsx**: Container managing multiple toast notifications
- **toggle-group.tsx**: Button group with exclusive selection
- **toggle.tsx**: Two-state button component
- **tooltip.tsx**: Informational popup on hover/focus
- **use-toast.ts**: Hook for creating and managing toast notifications

#### Data Visualization (`src/components/data-visualization/`)

**Chart Components (`src/components/data-visualization/charts/`):**
- **index.ts**: Exports all chart components for easier imports
- **area-chart.tsx**: Filled line chart for showing trends over time with volume
- **bar-chart.tsx**: Vertical or horizontal bar chart for category comparisons
- **chart-renderer.tsx**: Container component that selects and renders appropriate chart type
- **line-chart.tsx**: Line graph for showing continuous data and trends
- **pie-chart.tsx**: Circular chart for showing proportions of a whole
- **radar-chart.tsx**: Multi-variable chart for comparing entities across dimensions
- **scatter-chart.tsx**: Plot for showing correlation between two variables

**Other Data Visualization Components:**
- **components/**: General visualization components such as data tables and filtering controls
- **data-cleaning/**: Components for data cleaning operations including missing value handlers and outlier removal
- **statistical-analysis/**: 
  - **inferential-statistics/**: Components for statistical inference including hypothesis testing
  - **regression/**: Regression analysis components with various model types
- **utils/**: Utility functions for data transformation and formatting

#### Other Core Components (`src/components/`)

- **system-prompt.tsx**: System prompt editor component with templates and saving
- **settings.tsx**: Application settings panel with model configuration and appearance
- **file-upload.tsx**: File upload interface with drag-and-drop and progress indicators
- **data-panel.tsx**: Panel for data display and analysis with visualization options
- **code-display-block.tsx**: Code block rendering with syntax highlighting and copy functionality
- **settings-clear-chats.tsx**: Component to clear chat history with confirmation dialog
- **settings-theme-toggle.tsx**: Theme switching component for light/dark mode

#### State Management (`src/store/`)

- **chatStore.ts**: Zustand store for chat state management
  - Handles messages and message history
  - Manages chat session IDs and current selection
  - Controls model selection and parameters
  - Manages system prompts per conversation
  - Persists settings and history to localStorage
  - Error handling and recovery for chat operations
  
- **dataVisualizationStore.ts**: State management for data visualization
  - Manages uploaded data and dataset transformations
  - Controls chart settings and dimensions
  - Handles selected visualization types and parameters
  - Manages statistical analysis configuration
  - Stores and retrieves saved visualizations

#### Utilities (`src/utils/`)

- **chat-utils.ts**: Helper functions for chat operations including:
  - Message formatting and parsing
  - Chat history management
  - Model configuration helpers
  - Local storage interaction for chats

- **data-processing.ts**: Comprehensive data processing utilities:
  - Data cleaning and normalization
  - Type conversion and validation
  - Statistical calculations
  - Format conversion (CSV, JSON, etc.)
  
- **data-visualization-helpers.ts**: Utilities for preparing data for visualization
  - Data transformation for charts
  - Color mapping
  - Scale and axis calculations

**Statistics Utilities (`src/utils/statistics/`):**
- **index.ts**: Main export file for statistics functions
- **basic.ts**: Basic statistical operations (sum, mean, etc.)
- **central-tendency.ts**: Measures of central tendency (mean, median, mode)
- **dispersion.ts**: Measures of dispersion (variance, standard deviation)
- **distribution-shape.ts**: Analyzing distribution characteristics (skewness, kurtosis)
- **regression.ts**: Various regression algorithms and related utilities
- **types.ts**: TypeScript type definitions for statistical operations
- **utils.ts**: General utility functions for statistical calculations

**Mastra Utilities (`src/utils/mastra/`):**
- **index.ts**: Main export file for Mastra utilities
- **agents/**: Agent implementation helpers for LLM augmentation
- **providers/**: Service provider utilities for model connections
- **tools/**: Tool implementations for agents to perform tasks

#### Hooks (`src/hooks/`)

- **useChatActions.ts**: Custom hook for chat actions and message management
  - Sending messages
  - Loading chat history
  - Managing streaming responses
  - Error handling

- **use-mobile.ts**: Hook for detecting and responding to mobile screen sizes

#### Library Functions (`src/lib/`)

- **chatUtils.ts**: Core chat utility functions for message handling
- **token-counter.ts**: Utility for counting tokens in messages for model limits
- **utils.ts**: General utility functions used throughout the application

**Server Library (`src/lib/server/`):**
- Server-side helper functions for API integration
- Backend utilities for data processing
- Authentication and request handling

#### Providers (`src/providers/`)

- React context providers for application state management
- Theme provider for light/dark mode switching
- Toast notification provider
- Authentication state provider

#### Constants (`src/constants/`)

- **chart-colors.ts**: Color palette definitions for data visualization

#### Types (`src/types/`)

- TypeScript type definitions and interfaces for data structures
- API response and request type definitions
- Utility types for component props

### App Pages (`src/app/chats/`)

- **page.tsx**: Chat history page listing all conversations
- **[id]/page.tsx**: Dynamic route page for individual chat sessions

### Public Assets (`public/`)

- **uploads/**: Directory for uploaded files with data processing capabilities

## Technical Features

- **Streaming Responses**: Real-time text generation with AI SDK
- **Data Visualization**: Advanced data analysis capabilities with interactive charts
- **Local Storage**: Chat history persisted in browser storage
- **Theme System**: Light/dark mode with next-themes
- **System Prompts**: Custom system instructions per conversation
- **Code Highlighting**: Syntax highlighting for multiple programming languages
- **Responsive Design**: Adapts to various screen sizes from mobile to desktop
- **File Processing**: Support for CSV, Excel, and JSON data imports
- **Statistical Analysis**: Built-in statistical tools for data exploration

## Environment Configuration

The application connects to a vLLM or Ollama backend with these environment variables:

```
VLLM_URL=http://localhost:8000  # vLLM server address
VLLM_API_KEY=your-api-key       # Optional API key
VLLM_MODEL=llama3:8b            # Default model
VLLM_TOKEN_LIMIT=4096           # Maximum token limit
```

## Getting Started

### Using Docker

```bash
# With vLLM backend
docker run --rm -d -p 3000:3000 -e VLLM_URL=http://host.docker.internal:8000 nextjs-vllm-ui:latest

# With Ollama backend
docker run --rm -d -p 3000:3000 -e VLLM_URL=http://host.docker.internal:11434 -e VLLM_MODEL=llama3 nextjs-vllm-ui:latest
```

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```
