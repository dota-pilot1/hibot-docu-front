import { FileText, BarChart3, MessageCircleQuestion, Folder } from 'lucide-react';
import { ContentType, ProjectType } from '@/entities/project/model/types';

interface ContentTypeIconProps {
    type: ContentType | ProjectType;
    className?: string;
}

export const ContentTypeIcon = ({ type, className = "h-4 w-4" }: ContentTypeIconProps) => {
    switch (type) {
        case 'ROOT':
            return <Folder className={className} />;
        case 'NOTE':
            return <FileText className={className} />;
        case 'MERMAID':
            return <BarChart3 className={className} />;
        case 'QA':
            return <MessageCircleQuestion className={className} />;
        default:
            if (type === 'GITHUB' || type === 'FAQ' || type === 'MEMBER') {
                return <Folder className={className} />;
            }
            return <FileText className={className} />;
    }
};
