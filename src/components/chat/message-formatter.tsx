import React from "react";
import CodeDisplayBlock from "../code-display-block";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageFormatterProps {
  content: string;
}

/**
 * Component to format message content with support for markdown and code blocks
 * Handles code blocks by splitting on triple backticks and rendering them with CodeDisplayBlock
 */
export const MessageFormatter = ({ content }: MessageFormatterProps) => {
  return (
    <>
      {content.split("```").map((part, index) => {
        // Regular text (odd indexes in the split)
        if (index % 2 === 0) {
          return (
            <Markdown
              key={index}
              remarkPlugins={[remarkGfm]}
              className="prose dark:prose-invert max-w-full"
            >
              {part}
            </Markdown>
          );
        }
        // Code blocks (even indexes in the split)
        else {
          return <CodeDisplayBlock key={index} code={part.trim()} lang="" />;
        }
      })}
    </>
  );
};

export default MessageFormatter;
