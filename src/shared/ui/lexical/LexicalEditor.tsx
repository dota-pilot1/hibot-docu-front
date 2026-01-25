import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertToMarkdownString, $convertFromMarkdownString } from "@lexical/markdown";
import { CUSTOM_TRANSFORMERS } from "./markdownTransformers";
import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListNode, ListItemNode } from "@lexical/list";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LexicalToolbar } from "@/shared/ui/lexical/LexicalToolbar";
import {
  CodeMirrorNode,
  $createCodeMirrorNode,
} from "@/shared/ui/lexical/CodeMirrorNode";
import { ImageNode, $createImageNode } from "@/shared/ui/lexical/ImageNode";
import type { ImageAlignment } from "@/shared/ui/lexical/ImageNode";
import { ImagePlugin } from "@/shared/ui/lexical/ImagePlugin";

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder:
    "text-gray-400 font-medium absolute top-5 left-5 pointer-events-none text-sm",
  paragraph:
    "mb-2 relative font-medium text-sm leading-relaxed text-gray-700 text-left",
  quote: "border-l-4 border-gray-200 pl-4 italic text-gray-500 text-left",
  heading: {
    h1: "text-2xl font-black text-gray-900 mb-4 mt-6 text-left",
    h2: "text-xl font-black text-gray-900 mb-3 mt-5 text-left",
    h3: "text-lg font-black text-gray-900 mb-2 mt-4 text-left",
  },
  list: {
    nested: {
      listitem: "list-none",
    },
    ol: "list-decimal ml-6 mb-4",
    ul: "list-disc ml-6 mb-4",
    listitem: "mb-1",
  },
  link: "text-blue-600 underline",
  text: {
    bold: "font-black",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
  code: "bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[13px] text-gray-800",
};

function parseImageMarkdown(
  line: string,
): {
  altText: string;
  src: string;
  width?: number;
  alignment: ImageAlignment;
} | null {
  const imageRegex = /^!\[([^\]]*)\]\(([^)]+)\)$/;
  const match = imageRegex.exec(line.trim());
  if (!match) return null;

  const altPart = match[1];
  const src = match[2];

  let altText = altPart;
  let width: number | undefined;
  let alignment: ImageAlignment = "left";

  if (altPart.includes("|")) {
    const parts = altPart.split("|");
    altText = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith("width=")) {
        width = parseInt(part.replace("width=", ""), 10);
      } else if (part.startsWith("align=")) {
        alignment = part.replace("align=", "") as ImageAlignment;
      }
    }
  }

  return { altText, src, width, alignment };
}

function parseTextToNodes(text: string) {
  $convertFromMarkdownString(text, CUSTOM_TRANSFORMERS);
}

function serializeNodesToText(): string {
  return $convertToMarkdownString(CUSTOM_TRANSFORMERS);
}

function ValueSyncPlugin({
  value,
  isInitialLoad,
}: {
  value: string;
  isInitialLoad: React.RefObject<boolean>;
}) {
  const [editor] = useLexicalComposerContext();
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (isInitialLoad.current && value) {
      editor.update(() => {
        parseTextToNodes(value);
      });
      lastValueRef.current = value;
      isInitialLoad.current = false;
    }
  }, [editor, value, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad.current && value !== lastValueRef.current) {
      const hasFocus = document.activeElement?.closest("[data-lexical-editor]");
      if (!hasFocus) {
        editor.update(() => {
          parseTextToNodes(value);
        });
      }
      lastValueRef.current = value;
    }
  }, [editor, value, isInitialLoad]);

  return null;
}

interface LexicalEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function LexicalEditor({
  value,
  onChange,
  placeholder,
}: LexicalEditorProps) {
  const isInitialLoad = useRef(true);

  const initialConfig = {
    namespace: "TechNoteEditor",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
      CodeMirrorNode,
      ImageNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className="relative rounded-lg bg-white overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex flex-col h-[600px]"
        dir="ltr"
      >
        <LexicalToolbar />
        <div className="flex-1 relative overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-full p-5 outline-none text-sm" />
            }
            placeholder={
              <div className={theme.placeholder}>
                {placeholder || "내용을 입력하세요..."}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <ImagePlugin />
        <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
        <ValueSyncPlugin value={value} isInitialLoad={isInitialLoad} />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              const text = serializeNodesToText();
              onChange(text);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
