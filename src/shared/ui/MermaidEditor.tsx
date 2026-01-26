import React from 'react';
import CodeMirrorEditor from './CodeMirrorEditor';

interface MermaidEditorProps {
    content: string;
    onChange: (content: string) => void;
    readOnly?: boolean;
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
    content,
    onChange,
    readOnly = false,
}) => {
    return (
        <div className="mermaid-editor border rounded-md overflow-hidden">
            <CodeMirrorEditor
                code={content}
                language="markdown"
                onChange={onChange}
                onLanguageChange={() => { }}
                onRemove={() => { }}
                readOnly={readOnly}
            />
        </div>
    );
};
