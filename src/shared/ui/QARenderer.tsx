import React from 'react';
import { Badge } from './badge';

interface QARendererProps {
    question: string;
    answer: string;
    tags?: string[];
}

export const QARenderer: React.FC<QARendererProps> = ({ question, answer, tags = [] }) => {
    return (
        <div className="qa-renderer space-y-4 p-4 border rounded-lg bg-gray-50/50">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs">Q</span>
                    <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 font-bold text-xs">A</span>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{answer}</div>
                </div>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};
