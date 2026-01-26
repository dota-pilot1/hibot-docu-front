import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CSS } from '@dnd-kit/utilities';

interface SortableTreeItemProps {
    id: number;
    isAdminMode: boolean;
    children: (props: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
    }) => React.ReactNode;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({ id, children, isAdminMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full">
            {children({ attributes, listeners })}
        </div>
    );
};
