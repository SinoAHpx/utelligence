import { memo } from 'react';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering chat message content with Markdown support
 * Includes syntax highlighting for code blocks
 */
const MessageFormatter: FC<MessageFormatterProps> = ({ content, className }) => {
  return (
    <ReactMarkdown
      className={cn("prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        // Handle code blocks with syntax highlighting
        code({ className, children, ...props }) {
          // Extract language from className (if present)
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          // Handle inline code vs code blocks
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
        // Improve heading spacing
        h1: ({ children }) => <h1 className="mb-3 mt-6 text-2xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-bold">{children}</h3>,
        // Improve link styling 
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {children}
          </a>
        ),
        // Improve list item spacing and style
        li: ({ children }) => <li className="my-1">{children}</li>,
        p: ({ children }) => <p className="my-2">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MessageFormatter);
