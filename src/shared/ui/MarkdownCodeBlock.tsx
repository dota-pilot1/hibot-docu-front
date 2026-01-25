import React, { useState } from 'react';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface MarkdownCodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const MarkdownCodeBlock = ({ inline, className, children, ...props }: MarkdownCodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    if (inline) {
        return (
            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm" {...props}>
                {children}
            </code>
        );
    }

    if (!lang || lang === 'text') {
        const isSingleLine = !code.includes('\n') && code.length < 50;
        if (isSingleLine) {
            return (
                <span className="font-semibold text-blue-600 dark:text-blue-400 mx-0.5">
                    {children}
                </span>
            );
        }
        return (
            <div className={`my-3 py-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-sans ${className || ''}`} {...props}>
                {children}
            </div>
        );
    }

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700 shadow-sm bg-gray-950">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    {lang}
                </span>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[10px] ${copied
                        ? "text-green-400 bg-green-400/10"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                >
                    {copied ? (
                        <>
                            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                            <span>COPIED!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                            <span>COPY</span>
                        </>
                    )}
                </button>
            </div>
            <pre className={`p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300 bg-transparent m-0 ${className || ''}`} {...props}>
                <code>{children}</code>
            </pre>
        </div>
    );
};
