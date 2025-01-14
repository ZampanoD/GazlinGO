// A component for editing Markdown content with a rich toolbar for formatting.
// Provides buttons for common Markdown syntax (bold, italic, links, headings, lists, etc.).
// Supports real-time updates and integration with a parent component for handling changes.
// Includes tooltips for each toolbar button, translated using the language context.

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bold, Italic, Link, Heading2, Heading3, List, ListOrdered } from 'lucide-react';

interface MarkdownEditorProps {
    initialValue: string;
    onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onChange }) => {
    const [value, setValue] = useState(initialValue);
    const { t } = useLanguage();

    const toolbarButtons = [
        {
            icon: <Bold size={16} />,
            prefix: '**',
            suffix: '**'
        },
        {
            icon: <Italic size={16} />,
            prefix: '_',
            suffix: '_'
        },
        {
            icon: <Link size={16} />,
            prefix: '[',
            suffix: '](url)'
        },
        {
            icon: <Heading2 size={16} />,
            prefix: '## ',
            suffix: ''
        },
        {
            icon: <Heading3 size={16} />,
            prefix: '### ',
            suffix: ''
        },
        {
            icon: <List size={16} />,
            prefix: '- ',
            suffix: ''
        },
        {
            icon: <ListOrdered size={16} />,
            prefix: '1. ',
            suffix: ''
        },
    ];

    const insertMarkdown = (e: React.MouseEvent, prefix: string, suffix: string) => {
        e.preventDefault();

        const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newValue = before + prefix + (selection || 'text') + suffix + after;

        setValue(newValue);
        onChange(newValue);

        textarea.focus();

        if (!selection) {
            const newPosition = start + prefix.length;
            textarea.setSelectionRange(newPosition, newPosition + 4);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b">
                <div className="flex gap-1 items-center">
                    {toolbarButtons.map((button, index) => {
                        let tooltipKey = '';
                        switch(index) {
                            case 0: tooltipKey = 'boldText'; break;
                            case 1: tooltipKey = 'italicText'; break;
                            case 2: tooltipKey = 'insertLink'; break;
                            case 3: tooltipKey = 'heading2'; break;
                            case 4: tooltipKey = 'heading3'; break;
                            case 5: tooltipKey = 'bulletList'; break;
                            case 6: tooltipKey = 'numberedList'; break;
                            default: tooltipKey = '';
                        }

                        return (
                            <button
                                key={index}
                                onClick={(e) => insertMarkdown(e, button.prefix, button.suffix)}
                                type="button"
                                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                                title={t(tooltipKey)}
                            >
                                {button.icon}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4">
                <textarea
                    id="markdown-editor"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                    className="w-full min-h-[12rem] p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('enterDescription')}
                />
            </div>
        </div>
    );
};

export default MarkdownEditor;
