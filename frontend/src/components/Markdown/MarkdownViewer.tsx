// A component for rendering Markdown content with customizable styling.
// Uses `ReactMarkdown` to parse and display Markdown text.
// Supports Tailwind CSS classes for customizing the appearance of the rendered content.

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
    return (
        <article className={`prose prose-slate max-w-none ${className}`}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </article>
    );
};

export default MarkdownViewer;