import React from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Badge } from './badge';
import { X } from 'lucide-react';

interface QAEditorProps {
    answer: string;
    tags: string[];
    onAnswerChange: (value: string) => void;
    onTagsChange: (tags: string[]) => void;
}

export const QAEditor: React.FC<QAEditorProps> = ({
    answer,
    tags,
    onAnswerChange,
    onTagsChange,
}) => {
    const [tagInput, setTagInput] = React.useState('');

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                onTagsChange([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(tags.filter((t) => t !== tagToRemove));
    };

    return (
        <div className="qa-editor space-y-6">
            <div className="space-y-4">
                <Textarea
                    id="answer"
                    placeholder="답변을 입력하세요"
                    rows={8}
                    className="bg-white border-gray-300 focus:border-blue-500 p-4"
                    value={answer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                />
            </div>

            <div className="border-t border-gray-100" />

            <div className="space-y-4">
                <Label htmlFor="tags" className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">태그 (Tags)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-white border">
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <Input
                    id="tags"
                    placeholder="태그 입력 후 Enter"
                    className="bg-white h-8 text-sm"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                />
            </div>
        </div>
    );
};
