import { memo } from 'react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/utils';

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
    // Horizontal rule
    hr: () => <hr className="mt-2 mb-2 border-t border-border" />,
  };

  return (
    <div className={cn("max-w-none", className)}>
      <article className='prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent components change
export default memo(MessageFormatter);
