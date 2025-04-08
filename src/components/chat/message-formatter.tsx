import { memo } from 'react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type MessageFormatterProps = {
  content: string;
  className?: string;
};

/**
 * MessageFormatter renders chat content with Markdown and code syntax highlighting
 * 
 * Features:
 * - Renders markdown with GitHub Flavored Markdown support
 * - Syntax highlighting for code blocks with language detection
 * - Styled inline code and text formatting
 * - Responsive layout with proper spacing
 */
const MessageFormatter: FC<MessageFormatterProps> = ({ content, className }) => {
  // Custom rendering components for markdown elements
  const markdownComponents = {
    // Code block handling with syntax highlighting
    code({ className, children, ...props }: any) {
      // Extract language from className (format: language-xxx)
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      // Determine if we're dealing with a code block or inline code
      const isCodeBlock = props.node?.position?.start.line !== props.node?.position?.end.line;

      return isCodeBlock ? (
        <SyntaxHighlighter
          language={language || 'text'}
          style={atomDark}
          PreTag="div"
          customStyle={{
            borderRadius: '6px',
            marginTop: '1em',
            marginBottom: '1em',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1 py-0.5 rounded">
          {children}
        </code>
      );
    },
    // Optimized heading components
    h1: ({ children }: any) => (
      <h1 className="mb-3 mt-6 text-2xl font-bold">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mb-3 mt-5 text-xl font-bold">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mb-2 mt-4 text-lg font-bold">{children}</h3>
    ),
    // Enhanced link styling
    a: ({ children, href }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
      >
        {children}
      </a>
    ),
    // Improved list and paragraph spacing
    li: ({ children }: any) => <li className="my-1">{children}</li>,
    p: ({ children }: any) => <p className="my-2">{children}</p>,
  };

  return (
    <div className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent components change
export default memo(MessageFormatter);
