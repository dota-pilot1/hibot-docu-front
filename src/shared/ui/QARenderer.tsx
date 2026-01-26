import React from 'react';
import { Badge } from './badge';

interface QARendererProps {
    question: string;
    answer: string;
    tags?: string[];
}

export const QARenderer: React.FC<QARendererProps> = ({ question, answer, tags = [] }) => {
    return (
        <div className="qa-renderer space-y-6 p-8 border border-gray-200 rounded-xl bg-gray-50/80 shadow-sm">
            <div className="space-y-3">
                <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm ring-4 ring-blue-50">Q</span>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight pt-1">{question}</h3>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-sm ring-4 ring-emerald-50">A</span>
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed pt-1 text-lg font-medium">{answer}</div>
                </div>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors border-none">
                            #{tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};
