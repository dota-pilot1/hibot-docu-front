import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

interface MermaidRendererProps {
    content: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ content }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderDiagram = async () => {
            if (containerRef.current && content) {
                try {
                    // Clear previous content
                    containerRef.current.innerHTML = '';
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, content);
                    containerRef.current.innerHTML = svg;
                } catch (error) {
                    console.error('Mermaid rendering failed:', error);
                    containerRef.current.innerHTML = `<div class="text-red-500 p-4 border border-red-200 bg-red-50 rounded">
            <p class="font-bold">Mermaid Diagram Error</p>
            <p class="text-sm">Please check your syntax.</p>
          </div>`;
                }
            }
        };

        renderDiagram();
    }, [content]);

    return (
        <div className="mermaid-container w-full overflow-auto bg-white p-4 rounded-lg flex justify-center">
            <div ref={containerRef} />
        </div>
    );
};
